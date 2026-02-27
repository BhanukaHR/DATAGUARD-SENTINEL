export const APP_NAME = "DataGuard Sentinel";
export const APP_VERSION = "1.0.0";

export const COLLECTIONS = {
  DASHBOARD_ADMINS: "dashboardAdmins",
  ADMINS: "admins",
  USERS: "users",
  UPLOAD_EVENTS: "uploadEvents",
  RISK_PROFILES: "riskProfiles",
  ALERTS: "alerts",
  CLIPBOARD_EVENTS: "clipboardEvents",
  USB_EVENTS: "usbEvents",
  AUDIT_LOGS: "auditLogs",
  AGENTS: "agents",
  SETTINGS: "settings",
  FTP_EVENTS: "ftpEvents",
  EMAIL_EVENTS: "emailEvents",
  AI_EVENTS: "aiApplicationEvents",
} as const;

export const DEFAULT_PAGE_SIZE = 50;
export const AGENT_HEARTBEAT_TIMEOUT_SECONDS = 60;
export const DASHBOARD_REFRESH_INTERVAL_MS = 30000;

export const TRS_WEIGHTS = {
  sensitivityLevel: 40,
  destinationTrust: 25,
  fileSize: 15,
  timePattern: 10,
  fileType: 10,
} as const;

export const RISK_THRESHOLDS = {
  low: { min: 0, max: 30 },
  medium: { min: 31, max: 60 },
  high: { min: 61, max: 80 },
  critical: { min: 81, max: 100 },
} as const;

export const BIN_COLORS = [
  "#22c55e", "#4ade80", "#86efac",
  "#fde047", "#facc15", "#eab308",
  "#fb923c", "#f97316",
  "#f87171", "#ef4444",
];
