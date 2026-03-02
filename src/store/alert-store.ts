import { create } from "zustand";
import type { DlpAlert } from "../types/dlp-alert";
import type { UploadEvent } from "../types/upload-event";
import type { AiApplicationEvent } from "../types/ai-application-event";
import type { FtpTransferEvent } from "../types/ftp-event";
import type { EmailExfiltrationEvent } from "../types/email-event";

interface AlertState {
  liveAlerts: DlpAlert[];
  liveUploadEvents: UploadEvent[];
  liveAiEvents: AiApplicationEvent[];
  liveFtpEvents: FtpTransferEvent[];
  liveEmailEvents: EmailExfiltrationEvent[];
  unreadCount: number;
  addAlert: (alert: DlpAlert) => void;
  addUploadEvent: (event: UploadEvent) => void;
  addAiEvent: (event: AiApplicationEvent) => void;
  addFtpEvent: (event: FtpTransferEvent) => void;
  addEmailEvent: (event: EmailExfiltrationEvent) => void;
  updateRiskProfile: (profile: Record<string, unknown>, brsResult: Record<string, unknown>) => void;
  addEscalation: (data: Partial<DlpAlert>) => void;
  updateAgentStatus: (heartbeat: Record<string, unknown>) => void;
  clearAlerts: () => void;
  markAllRead: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  liveAlerts: [],
  liveUploadEvents: [],
  liveAiEvents: [],
  liveFtpEvents: [],
  liveEmailEvents: [],
  unreadCount: 0,

  addAlert: (alert) =>
    set((state) => ({
      liveAlerts: [alert, ...state.liveAlerts].slice(0, 100),
      unreadCount: state.unreadCount + 1,
    })),

  addUploadEvent: (event) =>
    set((state) => ({
      liveUploadEvents: [event, ...state.liveUploadEvents].slice(0, 100),
    })),

  addAiEvent: (event) =>
    set((state) => ({
      liveAiEvents: [event, ...state.liveAiEvents].slice(0, 100),
    })),

  addFtpEvent: (event) =>
    set((state) => ({
      liveFtpEvents: [event, ...state.liveFtpEvents].slice(0, 100),
    })),

  addEmailEvent: (event) =>
    set((state) => ({
      liveEmailEvents: [event, ...state.liveEmailEvents].slice(0, 100),
    })),

  updateRiskProfile: () => {},

  addEscalation: (data) =>
    set((state) => ({
      liveAlerts: [
        { ...data, type: "Critical", isEscalation: true } as DlpAlert,
        ...state.liveAlerts,
      ],
      unreadCount: state.unreadCount + 1,
    })),

  updateAgentStatus: () => {},

  clearAlerts: () => set({ liveAlerts: [], unreadCount: 0 }),
  markAllRead: () => set({ unreadCount: 0 }),
}));
