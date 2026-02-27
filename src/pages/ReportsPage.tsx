import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportService } from "../services/report-service";
import { ReportPreview } from "../components/reports/ReportPreview";
import type { ReportConfig } from "../types/report-config";
import { toast } from "sonner";
import { FileText, Download, Eye } from "lucide-react";

const SECTION_LABELS: Record<string, string> = {
  executiveSummary: "Executive Summary",
  riskScoreOverview: "Risk Score Overview",
  userRiskProfiles: "User Risk Profiles",
  alertSummary: "Alert Summary",
  uploadEventsAnalysis: "Upload Events Analysis",
  clipboardEventsAnalysis: "Clipboard Events Analysis",
  usbEventsAnalysis: "USB Events Analysis",
  aiApplicationEvents: "AI Application Events",
  agentHealthReport: "Agent Health Report",
  topRiskUsers: "Top Risk Users",
  channelBreakdownCharts: "Channel Breakdown Charts",
  sensitivityAnalysis: "Sensitivity Analysis",
  auditLogSummary: "Audit Log Summary",
  policyViolations: "Policy Violations",
};

const now = new Date();
const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

const DEFAULT_CONFIG: ReportConfig = {
  periodType: "monthly",
  month: defaultMonth,
  sections: {
    executiveSummary: true,
    riskScoreOverview: true,
    userRiskProfiles: true,
    alertSummary: true,
    uploadEventsAnalysis: true,
    clipboardEventsAnalysis: true,
    usbEventsAnalysis: true,
    aiApplicationEvents: true,
    agentHealthReport: true,
    topRiskUsers: true,
    channelBreakdownCharts: true,
    sensitivityAnalysis: true,
    auditLogSummary: true,
    policyViolations: true,
  },
  filters: {},
  format: "pdf",
  pdfOptions: {
    includeCharts: true,
    pageSize: "A4",
    orientation: "portrait",
    showPageNumbers: true,
    headerLogo: true,
  },
  csvOptions: {
    delimiter: ",",
    includeHeaders: true,
    separateSheets: true,
  },
};

export function ReportsPage() {
  const [config, setConfig] = useState<ReportConfig>(DEFAULT_CONFIG);
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const { data: reportData, refetch, isLoading } = useQuery({
    queryKey: ["reportData", config.month, config.startDate, config.endDate, config.filters],
    queryFn: () => reportService.fetchReportData(config),
    enabled: showPreview,
  });

  const handlePreview = () => {
    setShowPreview(true);
    refetch();
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      if ((config.format === "pdf" || config.format === "both") && reportRef.current) {
        const pdfBlob = await reportService.generatePdf(config, reportRef.current);
        downloadBlob(pdfBlob, `DataGuard-Report-${config.month || "custom"}.pdf`);
      }
      if ((config.format === "csv" || config.format === "both") && reportData) {
        const csvBlob = await reportService.generateCsv(config, reportData);
        downloadBlob(csvBlob, `DataGuard-Report-${config.month || "custom"}.xlsx`);
      }
      toast.success("Report generated successfully");
    } catch {
      toast.error("Failed to generate report");
    }
    setIsGenerating(false);
  };

  const toggleSection = (key: string) => {
    setConfig((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [key]: !prev.sections[key as keyof typeof prev.sections],
      },
    }));
  };

  const selectedCount = Object.values(config.sections).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-6 w-6 text-slate-700" />
        <h1 className="text-2xl font-semibold text-slate-900">Monthly Reports</h1>
      </div>

      {/* Report Configuration */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6">
        {/* Period */}
        <div>
          <h3 className="text-sm font-medium text-slate-900 mb-3">Report Period</h3>
          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={config.periodType === "monthly"}
                onChange={() => setConfig((p) => ({ ...p, periodType: "monthly" }))}
              />
              Monthly
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={config.periodType === "custom"}
                onChange={() => setConfig((p) => ({ ...p, periodType: "custom" }))}
              />
              Custom Range
            </label>
          </div>
          <div className="mt-2">
            {config.periodType === "monthly" ? (
              <input
                type="month"
                value={config.month || ""}
                onChange={(e) => setConfig((p) => ({ ...p, month: e.target.value }))}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-md"
              />
            ) : (
              <div className="flex gap-3 items-center">
                <input
                  type="date"
                  onChange={(e) => setConfig((p) => ({ ...p, startDate: e.target.value }))}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-md"
                />
                <span className="text-sm text-slate-500">to</span>
                <input
                  type="date"
                  onChange={(e) => setConfig((p) => ({ ...p, endDate: e.target.value }))}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-md"
                />
              </div>
            )}
          </div>
        </div>

        {/* Sections */}
        <div>
          <h3 className="text-sm font-medium text-slate-900 mb-3">
            Include Sections ({selectedCount}/{Object.keys(SECTION_LABELS).length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {Object.entries(SECTION_LABELS).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.sections[key as keyof typeof config.sections]}
                  onChange={() => toggleSection(key)}
                  className="rounded border-slate-300"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Format */}
        <div>
          <h3 className="text-sm font-medium text-slate-900 mb-3">Output Format</h3>
          <div className="flex gap-4">
            {(["pdf", "csv", "both"] as const).map((f) => (
              <label key={f} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={config.format === f}
                  onChange={() => setConfig((p) => ({ ...p, format: f }))}
                />
                {f === "pdf" ? "PDF Report" : f === "csv" ? "CSV/Excel Export" : "Both"}
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={handlePreview}
            disabled={isLoading}
            className="flex items-center gap-1 px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            <Eye className="h-4 w-4" />
            {isLoading ? "Loading..." : "Preview Report"}
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || (!showPreview && config.format !== "csv")}
            className="flex items-center gap-1 px-4 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate & Download"}
          </button>
        </div>
      </div>

      {/* Report Preview */}
      {showPreview && reportData && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center">
            <span className="text-sm font-medium text-slate-700">Report Preview</span>
            <span className="text-xs text-slate-400">{selectedCount} sections selected</span>
          </div>
          <div ref={reportRef}>
            <ReportPreview config={config} data={reportData} />
          </div>
        </div>
      )}
    </div>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
