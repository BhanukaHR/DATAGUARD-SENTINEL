import { EmailEventType, FileSensitivityLevel } from "./enums";

export interface EmailExfiltrationEvent {
  eventId: string;
  timestamp: Date | string;
  eventType: EmailEventType;
  applicationName: string;
  processName: string;
  processId: number;
  attachmentName: string;
  attachmentPath: string;
  attachmentSizeBytes: number;
  remoteAddress: string;
  remotePort: number;
  windowTitle: string;
  recipient: string;
  subject: string;
  sensitivityLevel: FileSensitivityLevel;
  riskScore: number;
  isBlocked: boolean;
  blockReason?: string;
  matchedPatterns: string[];
  userId: string;
  username?: string;
  deviceId?: string;
  agentId?: string;
}
