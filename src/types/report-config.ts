export interface ReportConfig {
  periodType: "monthly" | "custom";
  month?: string;
  startDate?: string;
  endDate?: string;
  sections: {
    executiveSummary: boolean;
    riskScoreOverview: boolean;
    userRiskProfiles: boolean;
    alertSummary: boolean;
    uploadEventsAnalysis: boolean;
    clipboardEventsAnalysis: boolean;
    usbEventsAnalysis: boolean;
    aiApplicationEvents: boolean;
    agentHealthReport: boolean;
    topRiskUsers: boolean;
    channelBreakdownCharts: boolean;
    sensitivityAnalysis: boolean;
    auditLogSummary: boolean;
    policyViolations: boolean;
  };
  filters: {
    department?: string;
    userId?: string;
    channel?: string;
    riskLevel?: string;
    sensitivityLevel?: string;
  };
  format: "pdf" | "csv" | "both";
  pdfOptions: {
    includeCharts: boolean;
    pageSize: "A4" | "Letter";
    orientation: "portrait" | "landscape";
    showPageNumbers: boolean;
    headerLogo: boolean;
  };
  csvOptions: {
    delimiter: "," | ";" | "\t";
    includeHeaders: boolean;
    separateSheets: boolean;
  };
}
