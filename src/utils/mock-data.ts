import { isoNowMinus } from "./formatters";
import type { UploadEvent } from "../types/upload-event";
import type { DlpAlert } from "../types/dlp-alert";
import type { UserRiskProfile } from "../types/user-risk-profile";
import type { ClipboardEvent } from "../types/clipboard-event";
import type { RemovableMediaEvent } from "../types/removable-media-event";
import type { AiApplicationEvent } from "../types/ai-application-event";
import type { AgentHeartbeat } from "../types/agent";
import type { AuditLog } from "../types/audit-log";
import type { UserAccount } from "../types/user";
import {
  UploadChannel, FileSensitivityLevel, FileCategory,
  DlpAlertType, DlpChannel, RiskLevel, ViolationType,
  AiEventType,
} from "../types/enums";

// ─── Users ────────────────────────────────────────────
export const MOCK_USERS: UserAccount[] = [
  { userId: "u-001", username: "nkbhr", employeeId: "EMP-1021", machineName: "FIN-LT-22", registeredAt: "2025-06-15T08:30:00Z", status: "active", registeredBy: "admin", department: "Finance", email: "nkbhr@company.com" },
  { userId: "u-002", username: "ulkh", employeeId: "EMP-1140", machineName: "IT-WS-07", registeredAt: "2025-07-02T09:00:00Z", status: "active", registeredBy: "admin", department: "IT", email: "ulkh@company.com" },
  { userId: "u-003", username: "analyst01", employeeId: "EMP-0902", machineName: "RD-WS-12", registeredAt: "2025-05-20T10:15:00Z", status: "active", registeredBy: "admin", department: "R&D", email: "analyst01@company.com" },
  { userId: "u-004", username: "temp.contractor", employeeId: "CTR-018", machineName: "OPS-CTR-03", registeredAt: "2025-09-01T14:30:00Z", status: "active", registeredBy: "admin", department: "Operations", email: "contractor@company.com" },
  { userId: "u-005", username: "sarah.jones", employeeId: "EMP-0745", machineName: "HR-LT-05", registeredAt: "2025-04-10T08:00:00Z", status: "active", registeredBy: "admin", department: "HR", email: "sjones@company.com" },
  { userId: "u-006", username: "mike.chen", employeeId: "EMP-1255", machineName: "SALES-WS-11", registeredAt: "2025-08-22T11:30:00Z", status: "inactive", registeredBy: "admin", department: "Sales", email: "mchen@company.com" },
  { userId: "u-007", username: "dev.intern", employeeId: "INT-003", machineName: "DEV-LT-19", registeredAt: "2026-01-10T09:00:00Z", status: "active", registeredBy: "admin", department: "Engineering", email: "devintern@company.com" },
  { userId: "u-008", username: "old.employee", employeeId: "EMP-0321", machineName: "MKT-LT-02", registeredAt: "2024-11-01T08:00:00Z", status: "uninstalled", registeredBy: "admin", department: "Marketing", email: "oldemp@company.com", uninstalledAt: "2025-12-15T17:00:00Z" },
];

// ─── Risk Profiles ────────────────────────────────────
export const MOCK_RISK_PROFILES: UserRiskProfile[] = [
  {
    userId: "u-001", username: "nkbhr", email: "nkbhr@company.com", department: "Finance",
    behavioralRiskScore: 72, currentRiskLevel: RiskLevel.High,
    totalUploads: 124, blockedUploads: 6, highRiskUploads: 14,
    lastUploadTime: isoNowMinus(2), profileCreatedAt: "2025-06-15T08:30:00Z", lastUpdatedAt: isoNowMinus(2),
    violationHistory: [
      { violationId: "v-001", eventId: "ev-902", description: "Restricted data via personal email", timestamp: isoNowMinus(8), type: ViolationType.SensitiveDataUpload, riskScoreImpact: 15 },
      { violationId: "v-002", eventId: "ev-910", description: "Off-hours large file upload", timestamp: isoNowMinus(1440), type: ViolationType.OffHoursActivity, riskScoreImpact: 8 },
    ],
  },
  {
    userId: "u-002", username: "ulkh", email: "ulkh@company.com", department: "IT",
    behavioralRiskScore: 38, currentRiskLevel: RiskLevel.Medium,
    totalUploads: 88, blockedUploads: 2, highRiskUploads: 5,
    lastUploadTime: isoNowMinus(12), profileCreatedAt: "2025-07-02T09:00:00Z", lastUpdatedAt: isoNowMinus(12),
    violationHistory: [
      { violationId: "v-003", eventId: "ev-903", description: "API keys synced to cloud", timestamp: isoNowMinus(20), type: ViolationType.SensitiveDataUpload, riskScoreImpact: 10 },
    ],
  },
  {
    userId: "u-003", username: "analyst01", email: "analyst01@company.com", department: "R&D",
    behavioralRiskScore: 15, currentRiskLevel: RiskLevel.Low,
    totalUploads: 41, blockedUploads: 0, highRiskUploads: 0,
    lastUploadTime: isoNowMinus(55), profileCreatedAt: "2025-05-20T10:15:00Z", lastUpdatedAt: isoNowMinus(55),
    violationHistory: [],
  },
  {
    userId: "u-004", username: "temp.contractor", email: "contractor@company.com", department: "Operations",
    behavioralRiskScore: 91, currentRiskLevel: RiskLevel.Critical,
    totalUploads: 206, blockedUploads: 18, highRiskUploads: 32,
    lastUploadTime: isoNowMinus(1), profileCreatedAt: "2025-09-01T14:30:00Z", lastUpdatedAt: isoNowMinus(1),
    violationHistory: [
      { violationId: "v-004", eventId: "ev-901", description: "Confidential spreadsheet to Google Drive", timestamp: isoNowMinus(3), type: ViolationType.UnauthorizedDestination, riskScoreImpact: 20 },
      { violationId: "v-005", eventId: "ev-920", description: "Multiple blocked uploads in sequence", timestamp: isoNowMinus(60), type: ViolationType.RepeatedBlocking, riskScoreImpact: 12 },
      { violationId: "v-006", eventId: "ev-921", description: "Excessive upload volume exceeded threshold", timestamp: isoNowMinus(120), type: ViolationType.ExcessiveUploadVolume, riskScoreImpact: 10 },
    ],
  },
  {
    userId: "u-005", username: "sarah.jones", email: "sjones@company.com", department: "HR",
    behavioralRiskScore: 25, currentRiskLevel: RiskLevel.Low,
    totalUploads: 67, blockedUploads: 1, highRiskUploads: 2,
    lastUploadTime: isoNowMinus(30), profileCreatedAt: "2025-04-10T08:00:00Z", lastUpdatedAt: isoNowMinus(30),
    violationHistory: [],
  },
  {
    userId: "u-006", username: "mike.chen", email: "mchen@company.com", department: "Sales",
    behavioralRiskScore: 55, currentRiskLevel: RiskLevel.Medium,
    totalUploads: 153, blockedUploads: 8, highRiskUploads: 11,
    lastUploadTime: isoNowMinus(180), profileCreatedAt: "2025-08-22T11:30:00Z", lastUpdatedAt: isoNowMinus(180),
    violationHistory: [
      { violationId: "v-007", eventId: "ev-930", description: "Customer list shared to personal cloud", timestamp: isoNowMinus(200), type: ViolationType.SuspiciousBehavior, riskScoreImpact: 15 },
    ],
  },
  {
    userId: "u-007", username: "dev.intern", email: "devintern@company.com", department: "Engineering",
    behavioralRiskScore: 8, currentRiskLevel: RiskLevel.Low,
    totalUploads: 12, blockedUploads: 0, highRiskUploads: 0,
    lastUploadTime: isoNowMinus(100), profileCreatedAt: "2026-01-10T09:00:00Z", lastUpdatedAt: isoNowMinus(100),
    violationHistory: [],
  },
];

// ─── Upload Events ────────────────────────────────────
export const MOCK_UPLOAD_EVENTS: UploadEvent[] = [
  {
    eventId: "ev-901", userId: "u-004", username: "temp.contractor", department: "Operations", deviceId: "OPS-CTR-03",
    timestamp: isoNowMinus(3), fileName: "client_list_q1.xlsx", fileExtension: ".xlsx", filePath: "C:\\Users\\contractor\\Documents\\client_list_q1.xlsx",
    fileSizeBytes: 1003520, channel: UploadChannel.Browser, applicationName: "Chrome", destinationUrl: "https://drive.google.com/upload",
    destinationDomain: "drive.google.com", destinationIpAddress: "142.250.185.238", sensitivityLevel: FileSensitivityLevel.Confidential,
    category: FileCategory.Spreadsheet, transactionRiskScore: 95, isBlocked: true, blockReason: "Untrusted destination + confidential file",
    fileHash: "a1b2c3d4e5f6", contentScanMatches: ["credit_card", "ssn_pattern"],
  },
  {
    eventId: "ev-902", userId: "u-001", username: "nkbhr", department: "Finance", deviceId: "FIN-LT-22",
    timestamp: isoNowMinus(8), fileName: "payslips.zip", fileExtension: ".zip", filePath: "C:\\Users\\nkbhr\\Documents\\payslips.zip",
    fileSizeBytes: 4218880, channel: UploadChannel.Email, applicationName: "Outlook", destinationUrl: "https://mail.yahoo.com",
    destinationDomain: "mail.yahoo.com", destinationIpAddress: "98.137.11.164", sensitivityLevel: FileSensitivityLevel.Restricted,
    category: FileCategory.Archive, transactionRiskScore: 88, isBlocked: true, blockReason: "Restricted data via personal email",
    fileHash: "b2c3d4e5f6g7", contentScanMatches: ["salary_data", "employee_id"],
  },
  {
    eventId: "ev-903", userId: "u-002", username: "ulkh", department: "IT", deviceId: "IT-WS-07",
    timestamp: isoNowMinus(20), fileName: "api_keys.txt", fileExtension: ".txt", filePath: "C:\\Users\\ulkh\\Dev\\api_keys.txt",
    fileSizeBytes: 6144, channel: UploadChannel.CloudSync, applicationName: "Dropbox", destinationUrl: "https://dropbox.com/sync",
    destinationDomain: "dropbox.com", destinationIpAddress: "162.125.66.1", sensitivityLevel: FileSensitivityLevel.Confidential,
    category: FileCategory.Code, transactionRiskScore: 62, isBlocked: false, blockReason: "Flagged for review",
    fileHash: "c3d4e5f6g7h8", contentScanMatches: ["api_key_pattern"],
  },
  {
    eventId: "ev-904", userId: "u-003", username: "analyst01", department: "R&D", deviceId: "RD-WS-12",
    timestamp: isoNowMinus(40), fileName: "design_notes.docx", fileExtension: ".docx", filePath: "C:\\Users\\analyst\\Documents\\design_notes.docx",
    fileSizeBytes: 225280, channel: UploadChannel.AI, applicationName: "ChatGPT", destinationUrl: "https://chat.openai.com",
    destinationDomain: "chat.openai.com", destinationIpAddress: "104.18.37.228", sensitivityLevel: FileSensitivityLevel.Internal,
    category: FileCategory.Document, transactionRiskScore: 28, isBlocked: false,
    fileHash: "d4e5f6g7h8i9",
  },
  {
    eventId: "ev-905", userId: "u-005", username: "sarah.jones", department: "HR", deviceId: "HR-LT-05",
    timestamp: isoNowMinus(45), fileName: "employee_reviews.pdf", fileExtension: ".pdf", filePath: "C:\\Users\\sjones\\Documents\\employee_reviews.pdf",
    fileSizeBytes: 3145728, channel: UploadChannel.Browser, applicationName: "Firefox", destinationUrl: "https://wetransfer.com",
    destinationDomain: "wetransfer.com", destinationIpAddress: "52.216.128.1", sensitivityLevel: FileSensitivityLevel.Restricted,
    category: FileCategory.Document, transactionRiskScore: 82, isBlocked: true, blockReason: "Restricted document to untrusted file sharing",
    fileHash: "e5f6g7h8i9j0", contentScanMatches: ["employee_name", "performance_rating"],
  },
  {
    eventId: "ev-906", userId: "u-004", username: "temp.contractor", department: "Operations", deviceId: "OPS-CTR-03",
    timestamp: isoNowMinus(60), fileName: "inventory_data.csv", fileExtension: ".csv", filePath: "C:\\Users\\contractor\\Desktop\\inventory_data.csv",
    fileSizeBytes: 512000, channel: UploadChannel.Browser, applicationName: "Chrome", destinationUrl: "https://pastebin.com",
    destinationDomain: "pastebin.com", destinationIpAddress: "104.20.67.143", sensitivityLevel: FileSensitivityLevel.Confidential,
    category: FileCategory.Spreadsheet, transactionRiskScore: 78, isBlocked: true, blockReason: "Blacklisted destination",
    fileHash: "f6g7h8i9j0k1",
  },
  {
    eventId: "ev-907", userId: "u-006", username: "mike.chen", department: "Sales", deviceId: "SALES-WS-11",
    timestamp: isoNowMinus(90), fileName: "Q4_pipeline.xlsx", fileExtension: ".xlsx", filePath: "C:\\Users\\mchen\\Documents\\Q4_pipeline.xlsx",
    fileSizeBytes: 1572864, channel: UploadChannel.Email, applicationName: "Outlook", destinationUrl: "https://outlook.live.com",
    destinationDomain: "outlook.live.com", destinationIpAddress: "52.98.208.1", sensitivityLevel: FileSensitivityLevel.Internal,
    category: FileCategory.Spreadsheet, transactionRiskScore: 45, isBlocked: false,
    fileHash: "g7h8i9j0k1l2",
  },
  {
    eventId: "ev-908", userId: "u-007", username: "dev.intern", department: "Engineering", deviceId: "DEV-LT-19",
    timestamp: isoNowMinus(120), fileName: "readme.md", fileExtension: ".md", filePath: "C:\\Users\\intern\\Projects\\readme.md",
    fileSizeBytes: 4096, channel: UploadChannel.Browser, applicationName: "Chrome", destinationUrl: "https://github.com",
    destinationDomain: "github.com", destinationIpAddress: "140.82.121.4", sensitivityLevel: FileSensitivityLevel.Public,
    category: FileCategory.Document, transactionRiskScore: 8, isBlocked: false,
    fileHash: "h8i9j0k1l2m3",
  },
  {
    eventId: "ev-909", userId: "u-001", username: "nkbhr", department: "Finance", deviceId: "FIN-LT-22",
    timestamp: isoNowMinus(150), fileName: "tax_records_2025.xlsx", fileExtension: ".xlsx", filePath: "C:\\Users\\nkbhr\\Documents\\tax_records_2025.xlsx",
    fileSizeBytes: 2097152, channel: UploadChannel.CloudSync, applicationName: "OneDrive", destinationUrl: "https://onedrive.live.com",
    destinationDomain: "onedrive.live.com", destinationIpAddress: "13.107.42.12", sensitivityLevel: FileSensitivityLevel.Restricted,
    category: FileCategory.Spreadsheet, transactionRiskScore: 55, isBlocked: false,
    fileHash: "i9j0k1l2m3n4", contentScanMatches: ["tax_id", "bank_account"],
  },
  {
    eventId: "ev-910", userId: "u-004", username: "temp.contractor", department: "Operations", deviceId: "OPS-CTR-03",
    timestamp: isoNowMinus(200), fileName: "database_backup.sql", fileExtension: ".sql", filePath: "C:\\Users\\contractor\\Backups\\database_backup.sql",
    fileSizeBytes: 52428800, channel: UploadChannel.FTP, applicationName: "FileZilla", destinationUrl: "ftp://external-server.com",
    destinationDomain: "external-server.com", destinationIpAddress: "203.0.113.50", sensitivityLevel: FileSensitivityLevel.Restricted,
    category: FileCategory.Database, transactionRiskScore: 98, isBlocked: true, blockReason: "Database export to unknown FTP server",
    fileHash: "j0k1l2m3n4o5", contentScanMatches: ["sql_dump", "connection_string"],
  },
];

// ─── Alerts ───────────────────────────────────────────
export const MOCK_ALERTS: DlpAlert[] = [
  {
    alertId: "al-101", type: DlpAlertType.Critical, channel: DlpChannel.Browser,
    title: "Blocked confidential upload to Google Drive", message: "Confidential spreadsheet attempted to upload to an untrusted destination.",
    fileName: "client_list_q1.xlsx", details: "File contained credit card numbers and SSN patterns. Upload was blocked.",
    sensitivityLevel: "Confidential", riskScore: 95, timestamp: isoNowMinus(3),
    userId: "u-004", username: "temp.contractor", isRead: false, isResolved: false, isEscalation: false,
  },
  {
    alertId: "al-102", type: DlpAlertType.Block, channel: DlpChannel.Email,
    title: "Restricted data attempt via personal email", message: "ZIP containing payslip data attempted via personal email domain.",
    fileName: "payslips.zip", details: "Restricted archive containing salary data sent to Yahoo Mail.",
    sensitivityLevel: "Restricted", riskScore: 88, timestamp: isoNowMinus(8),
    userId: "u-001", username: "nkbhr", isRead: true, isResolved: false, isEscalation: false,
  },
  {
    alertId: "al-103", type: DlpAlertType.Warning, channel: DlpChannel.CloudSync,
    title: "Possible secret exposure via cloud sync", message: "Potential API key file synced to Dropbox.",
    fileName: "api_keys.txt", details: "File matched API key pattern during content scan.",
    sensitivityLevel: "Confidential", riskScore: 62, timestamp: isoNowMinus(20),
    userId: "u-002", username: "ulkh", isRead: false, isResolved: false, isEscalation: false,
  },
  {
    alertId: "al-104", type: DlpAlertType.Critical, channel: DlpChannel.Browser,
    title: "ESCALATION: Repeat offender — temp.contractor", message: "User BRS exceeded critical threshold (91). Multiple violations detected.",
    fileName: "", details: "BRS: 91, Violations: 3+ in last 24 hours. Immediate investigation recommended.",
    sensitivityLevel: "", riskScore: 91, timestamp: isoNowMinus(5),
    userId: "u-004", username: "temp.contractor", isRead: false, isResolved: false, isEscalation: true,
  },
  {
    alertId: "al-105", type: DlpAlertType.Block, channel: DlpChannel.Browser,
    title: "Restricted HR document to file-sharing site", message: "Employee reviews PDF blocked from upload to WeTransfer.",
    fileName: "employee_reviews.pdf", details: "Document contained employee names and performance ratings.",
    sensitivityLevel: "Restricted", riskScore: 82, timestamp: isoNowMinus(45),
    userId: "u-005", username: "sarah.jones", isRead: true, isResolved: true, resolvedBy: "admin", resolvedAt: isoNowMinus(40),
    investigationNotes: "Confirmed accidental - user educated on data handling policy.", isEscalation: false,
  },
  {
    alertId: "al-106", type: DlpAlertType.Critical, channel: DlpChannel.Ftp,
    title: "Database export to unknown FTP server", message: "50MB SQL database backup attempted via FTP to external server.",
    fileName: "database_backup.sql", details: "Full database export containing connection strings and SQL dumps.",
    sensitivityLevel: "Restricted", riskScore: 98, timestamp: isoNowMinus(200),
    userId: "u-004", username: "temp.contractor", isRead: false, isResolved: false, isEscalation: false,
  },
  {
    alertId: "al-107", type: DlpAlertType.Info, channel: DlpChannel.AiApplication,
    title: "Internal document shared with AI assistant", message: "Design notes document uploaded to ChatGPT.",
    fileName: "design_notes.docx", details: "Internal document shared with external AI service.",
    sensitivityLevel: "Internal", riskScore: 28, timestamp: isoNowMinus(40),
    userId: "u-003", username: "analyst01", isRead: true, isResolved: false, isEscalation: false,
  },
  {
    alertId: "al-108", type: DlpAlertType.Warning, channel: DlpChannel.Browser,
    title: "Confidential data to blacklisted destination", message: "Inventory data uploaded to pastebin.com (blacklisted).",
    fileName: "inventory_data.csv", details: "Confidential inventory data attempted upload to known data leak site.",
    sensitivityLevel: "Confidential", riskScore: 78, timestamp: isoNowMinus(60),
    userId: "u-004", username: "temp.contractor", isRead: false, isResolved: false, isEscalation: false,
  },
];

// ─── Clipboard Events ─────────────────────────────────
export const MOCK_CLIPBOARD_EVENTS: ClipboardEvent[] = [
  {
    eventId: "clip-001", timestamp: isoNowMinus(5), userId: "u-001", username: "nkbhr",
    textContent: "4532-XXXX-XXXX-7891 Exp: 12/27", contentLength: 32, sourceProcess: "excel.exe",
    sourceWindowTitle: "Financial Report Q4.xlsx - Excel", containsSensitiveData: true,
    classification: "Credit Card Number", riskScore: 85, matchedPatterns: ["credit_card"],
    isTargetingAiApp: false,
  },
  {
    eventId: "clip-002", timestamp: isoNowMinus(15), userId: "u-002", username: "ulkh",
    textContent: "AKIA5EXAMPLE3KEY...(truncated)", contentLength: 40, sourceProcess: "vscode.exe",
    sourceWindowTitle: "config.env - Visual Studio Code", containsSensitiveData: true,
    classification: "AWS Access Key", riskScore: 72, matchedPatterns: ["api_key_pattern", "aws_access_key"],
    isTargetingAiApp: true, targetAiAppName: "ChatGPT",
  },
  {
    eventId: "clip-003", timestamp: isoNowMinus(25), userId: "u-004", username: "temp.contractor",
    textContent: "SELECT * FROM customers WHERE status...", contentLength: 156, sourceProcess: "ssms.exe",
    sourceWindowTitle: "SQL Server Management Studio", containsSensitiveData: true,
    classification: "SQL Query", riskScore: 65, matchedPatterns: ["sql_query"],
    isTargetingAiApp: true, targetAiAppName: "Claude",
  },
  {
    eventId: "clip-004", timestamp: isoNowMinus(35), userId: "u-003", username: "analyst01",
    textContent: "Meeting notes from engineering sync...", contentLength: 245, sourceProcess: "notepad.exe",
    sourceWindowTitle: "meeting-notes.txt - Notepad", containsSensitiveData: false,
    riskScore: 5, matchedPatterns: [],
    isTargetingAiApp: false,
  },
  {
    eventId: "clip-005", timestamp: isoNowMinus(50), userId: "u-004", username: "temp.contractor",
    textContent: "SSN: 123-45-6789, DOB: 1990-05-15...", contentLength: 89, sourceProcess: "chrome.exe",
    sourceWindowTitle: "Employee Database - Chrome", containsSensitiveData: true,
    classification: "Social Security Number", riskScore: 95, matchedPatterns: ["ssn_pattern", "date_of_birth"],
    isTargetingAiApp: true, targetAiAppName: "Copilot",
  },
];

// ─── USB Events ───────────────────────────────────────
export const MOCK_USB_EVENTS: RemovableMediaEvent[] = [
  {
    eventId: "usb-001", timestamp: isoNowMinus(10), userId: "u-004", username: "temp.contractor",
    driveLetter: "E:", volumeLabel: "USB_DRIVE", filePath: "E:\\Exports\\customer_data.xlsx",
    fileName: "customer_data.xlsx", fileSizeBytes: 2097152, changeType: "Created",
    sensitivityLevel: FileSensitivityLevel.Confidential, riskScore: 85, isBlocked: true,
    blockReason: "Confidential data to removable media blocked by policy",
  },
  {
    eventId: "usb-002", timestamp: isoNowMinus(30), userId: "u-001", username: "nkbhr",
    driveLetter: "F:", volumeLabel: "BACKUP_DRIVE", filePath: "F:\\Backup\\financial_report.pdf",
    fileName: "financial_report.pdf", fileSizeBytes: 5242880, changeType: "Created",
    sensitivityLevel: FileSensitivityLevel.Restricted, riskScore: 92, isBlocked: true,
    blockReason: "Restricted financial data to external drive",
  },
  {
    eventId: "usb-003", timestamp: isoNowMinus(60), userId: "u-003", username: "analyst01",
    driveLetter: "E:", volumeLabel: "SANDISK", filePath: "E:\\Photos\\team_photo.jpg",
    fileName: "team_photo.jpg", fileSizeBytes: 4194304, changeType: "Created",
    sensitivityLevel: FileSensitivityLevel.Public, riskScore: 5, isBlocked: false,
  },
  {
    eventId: "usb-004", timestamp: isoNowMinus(120), userId: "u-006", username: "mike.chen",
    driveLetter: "G:", volumeLabel: "KINGSTON", filePath: "G:\\Sales\\contracts_2025.zip",
    fileName: "contracts_2025.zip", fileSizeBytes: 15728640, changeType: "Created",
    sensitivityLevel: FileSensitivityLevel.Confidential, riskScore: 78, isBlocked: true,
    blockReason: "Large confidential archive to removable media",
  },
];

// ─── AI Application Events ───────────────────────────
export const MOCK_AI_EVENTS: AiApplicationEvent[] = [
  {
    eventId: "ai-001", timestamp: isoNowMinus(15), eventType: AiEventType.ClipboardPaste,
    applicationName: "ChatGPT", processName: "chrome.exe", windowTitle: "ChatGPT - Chrome",
    processId: 12456, remoteEndpoint: "104.18.37.228:443", resolvedDomain: "chat.openai.com",
    contentPreview: "AKIA5EXAMPLE3KEY...", contentLength: 40, isBlocked: false,
    blockReason: "", riskScore: 72, matchedPatterns: ["api_key_pattern"],
    userId: "u-002", username: "ulkh", deviceId: "IT-WS-07",
  },
  {
    eventId: "ai-002", timestamp: isoNowMinus(25), eventType: AiEventType.ClipboardPaste,
    applicationName: "Claude", processName: "msedge.exe", windowTitle: "Claude - Edge",
    processId: 8834, remoteEndpoint: "104.18.12.33:443", resolvedDomain: "claude.ai",
    contentPreview: "SELECT * FROM customers WHERE...", contentLength: 156, isBlocked: false,
    blockReason: "", riskScore: 65, matchedPatterns: ["sql_query"],
    userId: "u-004", username: "temp.contractor", deviceId: "OPS-CTR-03",
  },
  {
    eventId: "ai-003", timestamp: isoNowMinus(40), eventType: AiEventType.DataTransmission,
    applicationName: "ChatGPT", processName: "chrome.exe", windowTitle: "ChatGPT - Chrome",
    processId: 15672, remoteEndpoint: "104.18.37.228:443", resolvedDomain: "chat.openai.com",
    contentPreview: "Internal design document content...", contentLength: 2048, isBlocked: false,
    blockReason: "", riskScore: 28, matchedPatterns: [],
    userId: "u-003", username: "analyst01", deviceId: "RD-WS-12",
  },
  {
    eventId: "ai-004", timestamp: isoNowMinus(50), eventType: AiEventType.ClipboardPaste,
    applicationName: "Microsoft Copilot", processName: "msedge.exe", windowTitle: "Copilot - Edge",
    processId: 9921, remoteEndpoint: "13.107.42.16:443", resolvedDomain: "copilot.microsoft.com",
    contentPreview: "SSN: 123-45-6789, DOB: 1990...", contentLength: 89, isBlocked: true,
    blockReason: "PII data paste to AI application blocked", riskScore: 95, matchedPatterns: ["ssn_pattern", "date_of_birth"],
    userId: "u-004", username: "temp.contractor", deviceId: "OPS-CTR-03",
  },
  {
    eventId: "ai-005", timestamp: isoNowMinus(100), eventType: AiEventType.ProcessDetected,
    applicationName: "ChatGPT Desktop", processName: "chatgpt.exe", windowTitle: "ChatGPT",
    processId: 22340, remoteEndpoint: "", resolvedDomain: "",
    contentPreview: "", contentLength: 0, isBlocked: false,
    blockReason: "", riskScore: 10, matchedPatterns: [],
    userId: "u-007", username: "dev.intern", deviceId: "DEV-LT-19",
  },
  {
    eventId: "ai-006", timestamp: isoNowMinus(180), eventType: AiEventType.NetworkConnection,
    applicationName: "Google Gemini", processName: "chrome.exe", windowTitle: "Gemini - Chrome",
    processId: 19845, remoteEndpoint: "142.250.72.14:443", resolvedDomain: "gemini.google.com",
    contentPreview: "", contentLength: 0, isBlocked: false,
    blockReason: "", riskScore: 15, matchedPatterns: [],
    userId: "u-005", username: "sarah.jones", deviceId: "HR-LT-05",
  },
];

// ─── Agents ───────────────────────────────────────────
export const MOCK_AGENTS: AgentHeartbeat[] = [
  { agentId: "ag-001", machineName: "FIN-LT-22", organizationId: "org-001", lastHeartbeat: isoNowMinus(0.5), status: "online", scanCount: 891, currentUserId: "u-001", currentUsername: "nkbhr", agentVersion: "1.0.0", osVersion: "Windows 11 23H2", ipAddress: "192.168.1.22" },
  { agentId: "ag-002", machineName: "IT-WS-07", organizationId: "org-001", lastHeartbeat: isoNowMinus(1), status: "online", scanCount: 1203, currentUserId: "u-002", currentUsername: "ulkh", agentVersion: "1.0.0", osVersion: "Windows 11 23H2", ipAddress: "192.168.1.107" },
  { agentId: "ag-003", machineName: "OPS-CTR-03", organizationId: "org-001", lastHeartbeat: isoNowMinus(85), status: "offline", scanCount: 432, currentUserId: "u-004", currentUsername: "temp.contractor", agentVersion: "0.9.9", osVersion: "Windows 10 22H2", ipAddress: "192.168.1.203" },
  { agentId: "ag-004", machineName: "RD-WS-12", organizationId: "org-001", lastHeartbeat: isoNowMinus(2), status: "online", scanCount: 567, currentUserId: "u-003", currentUsername: "analyst01", agentVersion: "1.0.0", osVersion: "Windows 11 23H2", ipAddress: "192.168.1.112" },
  { agentId: "ag-005", machineName: "HR-LT-05", organizationId: "org-001", lastHeartbeat: isoNowMinus(3), status: "online", scanCount: 445, currentUserId: "u-005", currentUsername: "sarah.jones", agentVersion: "1.0.0", osVersion: "Windows 11 23H2", ipAddress: "192.168.1.55" },
  { agentId: "ag-006", machineName: "SALES-WS-11", organizationId: "org-001", lastHeartbeat: isoNowMinus(4), status: "warning", scanCount: 789, currentUserId: "u-006", currentUsername: "mike.chen", agentVersion: "1.0.0", osVersion: "Windows 10 22H2", ipAddress: "192.168.1.111" },
  { agentId: "ag-007", machineName: "DEV-LT-19", organizationId: "org-001", lastHeartbeat: isoNowMinus(1.5), status: "online", scanCount: 123, currentUserId: "u-007", currentUsername: "dev.intern", agentVersion: "1.0.0", osVersion: "Windows 11 24H2", ipAddress: "192.168.1.219" },
];

// ─── Audit Logs ───────────────────────────────────────
export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { logId: "log-001", action: "UPLOAD_BLOCKED", channel: "Browser", target: "client_list_q1.xlsx", details: "Blocked confidential upload to drive.google.com", riskScore: 95, userId: "u-004", username: "temp.contractor", timestamp: isoNowMinus(3) },
  { logId: "log-002", action: "UPLOAD_BLOCKED", channel: "Email", target: "payslips.zip", details: "Blocked restricted data via personal email", riskScore: 88, userId: "u-001", username: "nkbhr", timestamp: isoNowMinus(8) },
  { logId: "log-003", action: "UPLOAD_FLAGGED", channel: "CloudSync", target: "api_keys.txt", details: "API key file synced to Dropbox flagged for review", riskScore: 62, userId: "u-002", username: "ulkh", timestamp: isoNowMinus(20) },
  { logId: "log-004", action: "BRS_ESCALATION", channel: "System", target: "temp.contractor", details: "BRS exceeded critical threshold: 91", riskScore: 91, userId: "u-004", username: "temp.contractor", timestamp: isoNowMinus(5) },
  { logId: "log-005", action: "UPLOAD_BLOCKED", channel: "Browser", target: "employee_reviews.pdf", details: "Restricted HR document blocked from WeTransfer upload", riskScore: 82, userId: "u-005", username: "sarah.jones", timestamp: isoNowMinus(45) },
  { logId: "log-006", action: "ALERT_RESOLVED", channel: "System", target: "al-105", details: "Alert resolved by admin: confirmed accidental", riskScore: 0, userId: "admin", username: "admin", timestamp: isoNowMinus(40) },
  { logId: "log-007", action: "USB_BLOCKED", channel: "USB", target: "customer_data.xlsx", details: "Confidential data to removable media blocked", riskScore: 85, userId: "u-004", username: "temp.contractor", timestamp: isoNowMinus(10) },
  { logId: "log-008", action: "CLIPBOARD_DETECTED", channel: "Clipboard", target: "Credit card data", details: "Sensitive clipboard content detected from Excel", riskScore: 85, userId: "u-001", username: "nkbhr", timestamp: isoNowMinus(5) },
  { logId: "log-009", action: "AI_PASTE_DETECTED", channel: "AiApplication", target: "ChatGPT", details: "API key pasted to ChatGPT interface", riskScore: 72, userId: "u-002", username: "ulkh", timestamp: isoNowMinus(15) },
  { logId: "log-010", action: "UPLOAD_BLOCKED", channel: "FTP", target: "database_backup.sql", details: "Database export to unknown FTP blocked", riskScore: 98, userId: "u-004", username: "temp.contractor", timestamp: isoNowMinus(200) },
  { logId: "log-011", action: "AGENT_HEARTBEAT_LOST", channel: "System", target: "OPS-CTR-03", details: "Agent heartbeat lost for machine OPS-CTR-03", riskScore: 0, userId: "system", username: "system", timestamp: isoNowMinus(85) },
  { logId: "log-012", action: "UPLOAD_ALLOWED", channel: "Browser", target: "readme.md", details: "Public document uploaded to GitHub", riskScore: 8, userId: "u-007", username: "dev.intern", timestamp: isoNowMinus(120) },
];

// ─── Volume trend data ────────────────────────────────
export const MOCK_VOLUME_TREND = [
  { date: "2026-02-21", total: 24, blocked: 2 },
  { date: "2026-02-22", total: 30, blocked: 3 },
  { date: "2026-02-23", total: 22, blocked: 1 },
  { date: "2026-02-24", total: 38, blocked: 6 },
  { date: "2026-02-25", total: 41, blocked: 4 },
  { date: "2026-02-26", total: 18, blocked: 2 },
  { date: "2026-02-27", total: 29, blocked: 3 },
];
