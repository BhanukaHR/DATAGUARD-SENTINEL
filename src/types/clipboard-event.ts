export interface ClipboardEvent {
  eventId: string;
  timestamp: Date | string;
  userId: string;
  username?: string;
  textContent: string;
  contentLength: number;
  sourceProcess: string;
  sourceWindowTitle: string;
  containsSensitiveData: boolean;
  classification?: string;
  riskScore: number;
  matchedPatterns: string[];
  isTargetingAiApp: boolean;
  targetAiAppName?: string;
}
