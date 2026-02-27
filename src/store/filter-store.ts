import { create } from "zustand";

interface FilterState {
  globalSearch: string;
  dateRange: { start?: Date; end?: Date };
  channelFilter: string;
  sensitivityFilter: string;
  riskLevelFilter: string;
  statusFilter: string;
  setGlobalSearch: (search: string) => void;
  setDateRange: (range: { start?: Date; end?: Date }) => void;
  setChannelFilter: (channel: string) => void;
  setSensitivityFilter: (level: string) => void;
  setRiskLevelFilter: (level: string) => void;
  setStatusFilter: (status: string) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  globalSearch: "",
  dateRange: {},
  channelFilter: "all",
  sensitivityFilter: "all",
  riskLevelFilter: "all",
  statusFilter: "all",

  setGlobalSearch: (globalSearch) => set({ globalSearch }),
  setDateRange: (dateRange) => set({ dateRange }),
  setChannelFilter: (channelFilter) => set({ channelFilter }),
  setSensitivityFilter: (sensitivityFilter) => set({ sensitivityFilter }),
  setRiskLevelFilter: (riskLevelFilter) => set({ riskLevelFilter }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  resetFilters: () =>
    set({
      globalSearch: "",
      dateRange: {},
      channelFilter: "all",
      sensitivityFilter: "all",
      riskLevelFilter: "all",
      statusFilter: "all",
    }),
}));
