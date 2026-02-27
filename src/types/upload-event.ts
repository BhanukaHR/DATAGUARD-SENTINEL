import { UploadChannel, FileSensitivityLevel, FileCategory } from "./enums";

export interface UploadEvent {
  eventId: string;
  userId: string;
  username?: string;
  department?: string;
  deviceId: string;
  timestamp: Date | string;
  fileName: string;
  fileExtension: string;
  filePath: string;
  fileSizeBytes: number;
  channel: UploadChannel;
  applicationName: string;
  destinationUrl: string;
  destinationDomain: string;
  destinationIpAddress: string;
  sensitivityLevel: FileSensitivityLevel;
  category: FileCategory;
  transactionRiskScore: number;
  isBlocked: boolean;
  blockReason?: string;
  fileHash?: string;
  contentScanMatches?: string[];
}
