import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DashboardAdmin } from "../types/admin";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  admin: DashboardAdmin | null;
  setAuth: (state: { isAuthenticated: boolean; admin: DashboardAdmin | null }) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isLoading: true,
      admin: null,
      setAuth: ({ isAuthenticated, admin }) => set({ isAuthenticated, admin, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      clearAuth: () => set({ isAuthenticated: false, admin: null, isLoading: false }),
    }),
    { name: "dataguard-auth" }
  )
);
