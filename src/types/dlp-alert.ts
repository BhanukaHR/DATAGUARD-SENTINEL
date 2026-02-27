import { DlpAlertType, DlpChannel } from "./enums";

export interface DlpAlert {
  alertId: string;
  type: DlpAlertType;
  channel: DlpChannel;
  title: string;
  message: string;
  fileName: string;
  details: string;
  sensitivityLevel: string;
  riskScore: number;
  timestamp: Date | string;
  userId: string;
  username?: string;
  isRead: boolean;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date | string;
  investigationNotes?: string;
  isEscalation: boolean;
}
