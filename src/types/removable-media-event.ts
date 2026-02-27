import { FileSensitivityLevel } from "./enums";

export interface RemovableMediaEvent {
  eventId: string;
  timestamp: Date | string;
  userId: string;
  username?: string;
  driveLetter: string;
  volumeLabel: string;
  filePath: string;
  fileName: string;
  fileSizeBytes: number;
  changeType: string;
  sensitivityLevel: FileSensitivityLevel;
  riskScore: number;
  isBlocked: boolean;
  blockReason?: string;
}
