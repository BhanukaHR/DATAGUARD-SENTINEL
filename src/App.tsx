import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { useAuth } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { MainLayout } from "./components/layout/MainLayout";

import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AlertsPage } from "./pages/AlertsPage";
import { AlertDetailPage } from "./pages/AlertDetailPage";
import { UploadEventsPage } from "./pages/UploadEventsPage";
import { ClipboardEventsPage } from "./pages/ClipboardEventsPage";
import { UsbEventsPage } from "./pages/UsbEventsPage";
import { AiEventsPage } from "./pages/AiEventsPage";
import { EmailEventsPage } from "./pages/EmailEventsPage";
import { FtpEventsPage } from "./pages/FtpEventsPage";
import { UsersPage } from "./pages/UsersPage";
import { UserDetailPage } from "./pages/UserDetailPage";
import { AgentsPage } from "./pages/AgentsPage";
import { AuditLogPage } from "./pages/AuditLogPage";
import { RiskAnalyticsPage } from "./pages/RiskAnalyticsPage";
import { PolicyPage } from "./pages/PolicyPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ReportsPage } from "./pages/ReportsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchInterval: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  useAuth();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes (require admin auth) */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/alerts/:alertId" element={<AlertDetailPage />} />
            <Route path="/events/uploads" element={<UploadEventsPage />} />
            <Route path="/events/clipboard" element={<ClipboardEventsPage />} />
            <Route path="/events/usb" element={<UsbEventsPage />} />
            <Route path="/events/ai" element={<AiEventsPage />} />
            <Route path="/events/email" element={<EmailEventsPage />} />
            <Route path="/events/ftp" element={<FtpEventsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/:userId" element={<UserDetailPage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/audit-log" element={<AuditLogPage />} />
            <Route path="/analytics" element={<RiskAnalyticsPage />} />
            <Route path="/policy" element={<PolicyPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          className: "text-sm",
        }}
      />
    </QueryClientProvider>
  );
}
