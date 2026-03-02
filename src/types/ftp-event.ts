import { FtpEventType, FileSensitivityLevel } from "./enums";

export interface FtpTransferEvent {
  eventId: string;
  timestamp: Date | string;
  eventType: FtpEventType;
  applicationName: string;
  processName: string;
  processId: number;
  remoteAddress: string;
  remotePort: string;
  fileName: string;
  filePath: string;
  fileSizeBytes: number;
  windowTitle: string;
  sensitivityLevel: FileSensitivityLevel;
  riskScore: number;
  isBlocked: boolean;
  blockReason?: string;
  userId: string;
  username?: string;
  deviceId?: string;
  agentId?: string;
}
