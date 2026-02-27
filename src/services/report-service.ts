import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { utils as xlsxUtils, write as xlsxWrite } from "xlsx";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import type { ReportConfig } from "../types/report-config";

type ReportRecord = Record<string, unknown>;

interface ReportData {
  uploads?: ReportRecord[];
  clipboard?: ReportRecord[];
  usb?: ReportRecord[];
  alerts?: ReportRecord[];
  riskProfiles?: { docs?: { data: () => ReportRecord }[] } | ReportRecord[];
  agents?: { docs?: { data: () => ReportRecord }[] } | ReportRecord[];
  auditLogs?: ReportRecord[];
}

function getLastDayOfMonth(monthStr: string): Date {
  const [year, month] = monthStr.split("-").map(Number);
  return new Date(year, month, 0, 23, 59, 59);
}

export const reportService = {
  async fetchReportData(config: ReportConfig) {
    const startDate = config.periodType === "monthly"
      ? new Date(`${config.month}-01`)
      : new Date(config.startDate!);
    const endDate = config.periodType === "monthly"
      ? getLastDayOfMonth(config.month!)
      : new Date(config.endDate!);

    const start = Timestamp.fromDate(startDate);
    const end = Timestamp.fromDate(endDate);

    const queryByRange = async (colName: string) => {
      const q = query(
        collection(db, colName),
        where("timestamp", ">=", start),
        where("timestamp", "<=", end)
      );
      const snapshot = await getDocs(q);
      let docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (config.filters.department) {
        docs = docs.filter((d: ReportRecord) => d.department === config.filters.department);
      }
      if (config.filters.userId) {
        docs = docs.filter((d: ReportRecord) => d.userId === config.filters.userId || d.employeeId === config.filters.userId);
      }
      if (config.filters.channel) {
        docs = docs.filter((d: ReportRecord) => d.channel === config.filters.channel);
      }
      return docs;
    };

    const [uploads, clipboard, usb, alerts, riskProfiles, agents, auditLogs] = await Promise.all([
      queryByRange("uploadEvents"),
      queryByRange("clipboardEvents"),
      queryByRange("usbEvents"),
      queryByRange("alerts"),
      getDocs(collection(db, "riskProfiles")),
      getDocs(collection(db, "agents")),
      queryByRange("auditLogs"),
    ]);

    return { uploads, clipboard, usb, alerts, riskProfiles, agents, auditLogs };
  },

  async generatePdf(config: ReportConfig, previewElement: HTMLElement): Promise<Blob> {
    const pdf = new jsPDF({
      orientation: config.pdfOptions.orientation,
      unit: "mm",
      format: config.pdfOptions.pageSize.toLowerCase() as "a4" | "letter",
    });

    const canvas = await html2canvas(previewElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10;

    if (config.pdfOptions.headerLogo) {
      pdf.setFontSize(18);
      pdf.text("DataGuard Sentinel — Security Report", 10, 15);
      pdf.setFontSize(10);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 10, 22);
      pdf.text(`Period: ${config.month || `${config.startDate} — ${config.endDate}`}`, 10, 27);
      position = 35;
    }

    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - position;

    while (heightLeft > 0) {
      pdf.addPage();
      position = heightLeft - imgHeight;
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    if (config.pdfOptions.showPageNumbers) {
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 25, pageHeight - 5);
      }
    }

    return pdf.output("blob");
  },

  generateCsv(config: ReportConfig, data: ReportData): Blob {
    const workbook = xlsxUtils.book_new();

    if (config.sections.uploadEventsAnalysis && data.uploads) {
      const wsData = data.uploads.map((e: ReportRecord) => ({
        Timestamp: e.timestamp,
        User: e.userId,
        FileName: e.fileName,
        Channel: e.channel,
        Destination: e.destinationDomain,
        Sensitivity: e.sensitivityLevel,
        TRS: e.transactionRiskScore,
        Blocked: e.isBlocked ? "Yes" : "No",
        BlockReason: (e.blockReason as string) || "",
      }));
      const ws = xlsxUtils.json_to_sheet(wsData);
      xlsxUtils.book_append_sheet(workbook, ws, "Upload Events");
    }

    if (config.sections.clipboardEventsAnalysis && data.clipboard) {
      const wsData = data.clipboard.map((e: ReportRecord) => ({
        Timestamp: e.timestamp,
        SourceProcess: e.sourceProcess,
        ContentLength: e.contentLength,
        SensitiveData: e.containsSensitiveData ? "Yes" : "No",
        AiTarget: e.isTargetingAiApp ? (e.targetAiAppName as string) : "No",
        RiskScore: e.riskScore,
        MatchedPatterns: ((e.matchedPatterns as string[]) || []).join("; "),
      }));
      const ws = xlsxUtils.json_to_sheet(wsData);
      xlsxUtils.book_append_sheet(workbook, ws, "Clipboard Events");
    }

    if (config.sections.usbEventsAnalysis && data.usb) {
      const wsData = data.usb.map((e: ReportRecord) => ({
        Timestamp: e.timestamp,
        Drive: e.driveLetter,
        FileName: e.fileName,
        FileSize: e.fileSizeBytes,
        Sensitivity: e.sensitivityLevel,
        Blocked: e.isBlocked ? "Yes" : "No",
        BlockReason: (e.blockReason as string) || "",
      }));
      const ws = xlsxUtils.json_to_sheet(wsData);
      xlsxUtils.book_append_sheet(workbook, ws, "USB Events");
    }

    if (config.sections.alertSummary && data.alerts) {
      const wsData = data.alerts.map((a: ReportRecord) => ({
        Timestamp: a.timestamp,
        Type: a.type,
        Channel: a.channel,
        Title: a.title,
        RiskScore: a.riskScore,
        Resolved: a.isResolved ? "Yes" : "No",
      }));
      const ws = xlsxUtils.json_to_sheet(wsData);
      xlsxUtils.book_append_sheet(workbook, ws, "Alerts");
    }

    if (config.sections.userRiskProfiles && data.riskProfiles) {
      const docs = (data.riskProfiles as { docs?: { data: () => ReportRecord }[] }).docs || [];
      const wsData = docs.map((d: { data: () => ReportRecord }) => {
        const p = d.data ? d.data() : (d as unknown as ReportRecord);
        return {
          Username: p.username,
          EmployeeId: p.userId,
          Department: p.department,
          BRS: p.behavioralRiskScore,
          RiskLevel: p.currentRiskLevel,
          TotalUploads: p.totalUploads,
          BlockedUploads: p.blockedUploads,
          Violations: ((p.violationHistory as unknown[]) || []).length,
        };
      });
      const ws = xlsxUtils.json_to_sheet(wsData);
      xlsxUtils.book_append_sheet(workbook, ws, "User Risk Profiles");
    }

    const arrayBuffer = xlsxWrite(workbook, { bookType: "xlsx", type: "array" });
    return new Blob([arrayBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  },
};

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
