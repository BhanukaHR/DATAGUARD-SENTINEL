import { AiEventType } from "./enums";

export interface AiApplicationEvent {
  eventId: string;
  timestamp: Date | string;
  eventType: AiEventType;
  applicationName: string;
  processName: string;
  windowTitle: string;
  processId: number;
  remoteEndpoint: string;
  resolvedDomain: string;
  contentPreview: string;
  contentLength: number;
  isBlocked: boolean;
  blockReason: string;
  riskScore: number;
  matchedPatterns: string[];
  userId: string;
  username?: string;
  deviceId: string;
}
