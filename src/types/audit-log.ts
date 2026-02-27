export interface AuditLog {
  logId: string;
  action: string;
  channel: string;
  target: string;
  details: string;
  riskScore: number;
  userId: string;
  username?: string;
  timestamp: Date | string;
}
