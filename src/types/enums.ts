export const UploadChannel = {
  Unknown: "Unknown",
  Browser: "Browser",
  CloudSync: "CloudSync",
  FTP: "FTP",
  Email: "Email",
  EnterpriseApp: "EnterpriseApp",
  USB: "USB",
  Clipboard: "Clipboard",
  AI: "AI",
} as const;
export type UploadChannel = (typeof UploadChannel)[keyof typeof UploadChannel];

export const FileSensitivityLevel = {
  Public: "Public",
  Internal: "Internal",
  Confidential: "Confidential",
  Restricted: "Restricted",
} as const;
export type FileSensitivityLevel = (typeof FileSensitivityLevel)[keyof typeof FileSensitivityLevel];

export const FileCategory = {
  Document: "Document",
  Spreadsheet: "Spreadsheet",
  Image: "Image",
  Video: "Video",
  Archive: "Archive",
  Code: "Code",
  Database: "Database",
  Other: "Other",
} as const;
export type FileCategory = (typeof FileCategory)[keyof typeof FileCategory];

export const DlpAlertType = {
  Info: "Info",
  Warning: "Warning",
  Block: "Block",
  Critical: "Critical",
} as const;
export type DlpAlertType = (typeof DlpAlertType)[keyof typeof DlpAlertType];

export const DlpChannel = {
  Browser: "Browser",
  Clipboard: "Clipboard",
  USB: "USB",
  FileSystem: "FileSystem",
  Email: "Email",
  Ftp: "Ftp",
  CloudSync: "CloudSync",
  AiApplication: "AiApplication",
} as const;
export type DlpChannel = (typeof DlpChannel)[keyof typeof DlpChannel];

export const RiskLevel = {
  Low: "Low",
  Medium: "Medium",
  High: "High",
  Critical: "Critical",
} as const;
export type RiskLevel = (typeof RiskLevel)[keyof typeof RiskLevel];

export const ViolationType = {
  UnauthorizedDestination: "UnauthorizedDestination",
  SensitiveDataUpload: "SensitiveDataUpload",
  ExcessiveUploadVolume: "ExcessiveUploadVolume",
  OffHoursActivity: "OffHoursActivity",
  RepeatedBlocking: "RepeatedBlocking",
  SuspiciousBehavior: "SuspiciousBehavior",
} as const;
export type ViolationType = (typeof ViolationType)[keyof typeof ViolationType];

export const AiEventType = {
  ProcessDetected: "ProcessDetected",
  NetworkConnection: "NetworkConnection",
  ClipboardPaste: "ClipboardPaste",
  ActiveWindowDetected: "ActiveWindowDetected",
  DataTransmission: "DataTransmission",
  FileAccess: "FileAccess",
} as const;
export type AiEventType = (typeof AiEventType)[keyof typeof AiEventType];

export const TrustCategory = {
  Trusted: "Trusted",
  Known: "Known",
  Unknown: "Unknown",
  Suspicious: "Suspicious",
  Blacklisted: "Blacklisted",
} as const;
export type TrustCategory = (typeof TrustCategory)[keyof typeof TrustCategory];
