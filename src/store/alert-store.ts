import { create } from "zustand";
import type { DlpAlert } from "../types/dlp-alert";
import type { UploadEvent } from "../types/upload-event";

interface AlertState {
  liveAlerts: DlpAlert[];
  liveUploadEvents: UploadEvent[];
  unreadCount: number;
  addAlert: (alert: DlpAlert) => void;
  addUploadEvent: (event: UploadEvent) => void;
  updateRiskProfile: (profile: Record<string, unknown>, brsResult: Record<string, unknown>) => void;
  addEscalation: (data: Partial<DlpAlert>) => void;
  updateAgentStatus: (heartbeat: Record<string, unknown>) => void;
  clearAlerts: () => void;
  markAllRead: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  liveAlerts: [],
  liveUploadEvents: [],
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
