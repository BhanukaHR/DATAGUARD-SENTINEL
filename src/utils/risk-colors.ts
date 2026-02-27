export const RISK_COLORS: Record<string, string> = {
  Low: "#22c55e",
  Medium: "#eab308",
  High: "#f97316",
  Critical: "#ef4444",
};

export const SENSITIVITY_COLORS: Record<string, string> = {
  Public: "#22c55e",
  Internal: "#3b82f6",
  Confidential: "#f97316",
  Restricted: "#ef4444",
};

export const CHANNEL_COLORS: Record<string, string> = {
  Browser: "#3b82f6",
  Clipboard: "#8b5cf6",
  USB: "#f97316",
  AiApplication: "#ef4444",
  AI: "#ef4444",
  FileSystem: "#6b7280",
  Email: "#14b8a6",
  FTP: "#eab308",
  Ftp: "#eab308",
  CloudSync: "#06b6d4",
  EnterpriseApp: "#a855f7",
  Unknown: "#94a3b8",
};

export const ALERT_COLORS: Record<string, string> = {
  Info: "#3b82f6",
  Warning: "#eab308",
  Block: "#f97316",
  Critical: "#ef4444",
};

export const FILE_TYPE_COLORS: Record<string, string> = {
  Document: "#3b82f6",
  Spreadsheet: "#22c55e",
  Archive: "#f97316",
  Code: "#6366f1",
  Database: "#ef4444",
  Image: "#ec4899",
  Video: "#8b5cf6",
  Other: "#94a3b8",
};

export const RISK_BG_CLASSES: Record<string, string> = {
  Low: "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  High: "bg-orange-100 text-orange-800",
  Critical: "bg-red-100 text-red-800",
};

export const SENSITIVITY_BG_CLASSES: Record<string, string> = {
  Public: "bg-green-100 text-green-800",
  Internal: "bg-blue-100 text-blue-800",
  Confidential: "bg-orange-100 text-orange-800",
  Restricted: "bg-red-100 text-red-800",
};

export const ALERT_BG_CLASSES: Record<string, string> = {
  Info: "bg-blue-100 text-blue-800",
  Warning: "bg-yellow-100 text-yellow-800",
  Block: "bg-orange-100 text-orange-800",
  Critical: "bg-red-100 text-red-800",
};

export const STATUS_BG_CLASSES: Record<string, string> = {
  online: "bg-green-100 text-green-800",
  Online: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  Warning: "bg-yellow-100 text-yellow-800",
  Degraded: "bg-yellow-100 text-yellow-800",
  offline: "bg-red-100 text-red-800",
  Offline: "bg-red-100 text-red-800",
};

export const STATUS_DOT_CLASSES: Record<string, string> = {
  online: "bg-green-500",
  Online: "bg-green-500",
  warning: "bg-yellow-500",
  Warning: "bg-yellow-500",
  Degraded: "bg-yellow-500",
  offline: "bg-red-500",
  Offline: "bg-red-500",
};
