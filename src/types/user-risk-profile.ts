import { RiskLevel, ViolationType } from "./enums";

export interface ViolationRecord {
  violationId: string;
  eventId: string;
  description: string;
  timestamp: Date | string;
  type: ViolationType;
  riskScoreImpact: number;
}

export interface UserRiskProfile {
  userId: string;
  username: string;
  email: string;
  department: string;
  behavioralRiskScore: number;
  currentRiskLevel: RiskLevel;
  totalUploads: number;
  blockedUploads: number;
  highRiskUploads: number;
  lastUploadTime: Date | string;
  profileCreatedAt: Date | string;
  lastUpdatedAt: Date | string;
  violationHistory: ViolationRecord[];
}
