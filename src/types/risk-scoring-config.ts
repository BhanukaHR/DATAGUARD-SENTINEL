import { TrustCategory } from "./enums";

export interface RiskScoringConfig {
  sensitivityLevelWeight: number;
  destinationTrustWeight: number;
  uploadVolumeWeight: number;
  timePatternWeight: number;
  fileTypeWeight: number;
  initialBRS: number;
  maxBRS: number;
  violationIncrement: number;
  decayRate: number;
  lowRiskThreshold: number;
  mediumRiskThreshold: number;
  highRiskThreshold: number;
  alertThreshold: number;
  blockThreshold: number;
}

export interface DestinationTrustLevel {
  domain: string;
  category: TrustCategory;
  trustScore: number;
  addedAt: Date | string;
}
