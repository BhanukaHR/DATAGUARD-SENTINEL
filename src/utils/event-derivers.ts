import type { DlpAlert } from "../types/dlp-alert";
import { FileCategory, FileSensitivityLevel, EmailEventType, UploadChannel } from "../types/enums";
import type { UploadEvent } from "../types/upload-event";
import type { EmailExfiltrationEvent } from "../types/email-event";
import type { RemovableMediaEvent } from "../types/removable-media-event";
import type { FtpTransferEvent } from "../types/ftp-event";
import type { ClipboardEvent } from "../types/clipboard-event";

function getFileExtension(fileName: string): string {
  const index = fileName.lastIndexOf(".");
  return index >= 0 ? fileName.slice(index + 1).toLowerCase() : "";
}

function getFileCategory(fileName: string) {
  const extension = getFileExtension(fileName);
  if (["doc", "docx", "pdf", "txt", "rtf"].includes(extension)) return FileCategory.Document;
  if (["xls", "xlsx", "csv"].includes(extension)) return FileCategory.Spreadsheet;
  if (["png", "jpg", "jpeg", "gif", "bmp", "webp"].includes(extension)) return FileCategory.Image;
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(extension)) return FileCategory.Video;
  if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) return FileCategory.Archive;
  if (["js", "ts", "tsx", "jsx", "cs", "py", "java", "json", "xml", "html", "css"].includes(extension)) return FileCategory.Code;
  if (["db", "sqlite", "sql"].includes(extension)) return FileCategory.Database;
  return FileCategory.Other;
}

function getSensitivityLevel(value: string | undefined): FileSensitivityLevel {
  if (value === FileSensitivityLevel.Public) return FileSensitivityLevel.Public;
  if (value === FileSensitivityLevel.Internal) return FileSensitivityLevel.Internal;
  if (value === FileSensitivityLevel.Confidential) return FileSensitivityLevel.Confidential;
  if (value === FileSensitivityLevel.Restricted) return FileSensitivityLevel.Restricted;
  return FileSensitivityLevel.Internal;
}

function mapChannelToUploadChannel(channel: string | undefined): UploadChannel {
  if (!channel) return UploadChannel.Unknown;
  if (channel === "Browser") return UploadChannel.Browser;
  if (channel === "Email") return UploadChannel.Email;
  if (channel === "AiApplication") return UploadChannel.AI;
  if (channel === "Ftp") return UploadChannel.FTP;
  if (channel === "USB") return UploadChannel.USB;
  if (channel === "FileSystem") return UploadChannel.FileSystem;
  if (channel === "Clipboard") return UploadChannel.Clipboard;
  if (channel === "CloudSync") return UploadChannel.CloudSync;
  if (channel === "EnterpriseApp") return UploadChannel.EnterpriseApp;
  return UploadChannel.Unknown;
}

function getAlertBase(alert: DlpAlert) {
  return {
    eventId: `alert-${alert.alertId}`,
    timestamp: alert.timestamp,
    userId: alert.userId,
    username: alert.username,
    deviceId: alert.agentId || alert.userId || "unknown-device",
    sensitivityLevel: getSensitivityLevel(alert.sensitivityLevel),
    riskScore: alert.riskScore,
    isBlocked: alert.type === "Block" || alert.type === "Critical",
    blockReason: alert.message,
  };
}

export function deriveUploadEventFromAlert(alert: DlpAlert): UploadEvent {
  const fileName = alert.fileName || alert.title || "Unknown file";
  return {
    ...getAlertBase(alert),
    channel: mapChannelToUploadChannel(alert.channel),
    fileName,
    fileExtension: getFileExtension(fileName),
    filePath: fileName,
    fileSizeBytes: 0,
    applicationName: alert.title || "Alert",
    destinationUrl: "",
    destinationDomain: "",
    destinationIpAddress: "",
    category: getFileCategory(fileName),
    transactionRiskScore: alert.riskScore,
    fileHash: undefined,
    contentScanMatches: alert.details ? [alert.details] : [],
  };
}

export function deriveEmailEventFromAlert(alert: DlpAlert): EmailExfiltrationEvent {
  const fileName = alert.fileName || alert.title || "Unknown attachment";
  return {
    ...getAlertBase(alert),
    eventType: EmailEventType.AttachmentDetected,
    applicationName: alert.title || "Mail client",
    processName: alert.title || "Mail client",
    processId: 0,
    attachmentName: fileName,
    attachmentPath: fileName,
    attachmentSizeBytes: 0,
    remoteAddress: "",
    remotePort: 0,
    windowTitle: alert.title || "Email activity",
    recipient: "",
    subject: alert.message || "",
    matchedPatterns: alert.details ? [alert.details] : [],
    agentId: alert.agentId,
  };
}

export function deriveUsbEventFromAlert(alert: DlpAlert): RemovableMediaEvent {
  const fileName = alert.fileName || alert.title || "Unknown file";
  return {
    eventId: `alert-${alert.alertId}`,
    timestamp: alert.timestamp,
    userId: alert.userId,
    username: alert.username,
    driveLetter: "?:",
    volumeLabel: "USB Device",
    filePath: fileName,
    fileName,
    fileSizeBytes: 0,
    changeType: "Copy",
    sensitivityLevel: getSensitivityLevel(alert.sensitivityLevel),
    riskScore: alert.riskScore,
    isBlocked: alert.type === "Block" || alert.type === "Critical",
    blockReason: alert.message,
  };
}

export function deriveFtpEventFromAlert(alert: DlpAlert): FtpTransferEvent {
  const fileName = alert.fileName || alert.title || "Unknown file";
  return {
    eventId: `alert-${alert.alertId}`,
    timestamp: alert.timestamp,
    userId: alert.userId,
    username: alert.username,
    deviceId: alert.agentId || alert.userId || "unknown-device",
    eventType: "FileTransfer" as const,
    applicationName: alert.title || "FTP Client",
    processName: alert.title || "FTP Client",
    processId: 0,
    fileName,
    filePath: fileName,
    fileSizeBytes: 0,
    remoteAddress: "",
    remotePort: "21",
    windowTitle: alert.title || "FTP Activity",
    sensitivityLevel: getSensitivityLevel(alert.sensitivityLevel),
    riskScore: alert.riskScore,
    isBlocked: alert.type === "Block" || alert.type === "Critical",
    blockReason: alert.message,
    agentId: alert.agentId,
  };
}

export function deriveClipboardEventFromAlert(alert: DlpAlert): ClipboardEvent {
  return {
    eventId: `alert-${alert.alertId}`,
    timestamp: alert.timestamp,
    userId: alert.userId,
    username: alert.username,
    textContent: alert.message || "",
    contentLength: alert.message?.length || 0,
    sourceProcess: alert.title || "Unknown process",
    sourceWindowTitle: alert.title || "Alert",
    containsSensitiveData: alert.riskScore >= 50,
    classification: alert.sensitivityLevel,
    riskScore: alert.riskScore,
    matchedPatterns: alert.details ? [alert.details] : [],
    isTargetingAiApp: alert.riskScore >= 75,
    targetAiAppName: alert.title?.includes("AI") ? alert.title : undefined,
  };
}