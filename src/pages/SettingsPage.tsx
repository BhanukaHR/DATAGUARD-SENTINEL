import { DashboardCredentialsForm } from "../components/settings/DashboardCredentialsForm";
import { AgentAdminManager } from "../components/settings/AgentAdminManager";
import { DeleteDataSection } from "../components/settings/DeleteDataSection";
import { useAuthStore } from "../store/auth-store";
import { Settings } from "lucide-react";

export function SettingsPage() {
  const { admin } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-slate-700" />
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
      </div>

      {/* Admin Profile */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-sm font-medium text-slate-900 mb-3">Admin Profile</h3>
        <dl className="grid grid-cols-2 gap-3 text-sm max-w-md">
          <dt className="text-slate-500">Email</dt>
          <dd className="text-slate-900">{admin?.email || "—"}</dd>
          <dt className="text-slate-500">Role</dt>
          <dd className="text-slate-900">{admin?.role || "dashboard_admin"}</dd>
          <dt className="text-slate-500">Username</dt>
          <dd className="text-slate-900">{admin?.username || "—"}</dd>
        </dl>
      </div>

      {/* Dashboard Admin Credentials */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Dashboard Admin Credentials</h2>
        <p className="text-sm text-slate-500 mb-4">
          Change your dashboard login email and password. These are used to access this admin dashboard only.
        </p>
        <DashboardCredentialsForm />
      </div>

      <hr className="border-slate-200" />

      {/* Agent Admin Credentials */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Agent Admin Credentials</h2>
        <p className="text-sm text-slate-500 mb-4">
          View and change the login credentials used by ConfigUI / endpoint agent software.
          These are completely separate from your dashboard login.
        </p>
        <AgentAdminManager />
      </div>

      <hr className="border-slate-200" />

      {/* Connection Info */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-sm font-medium text-slate-900 mb-3">Connection Information</h3>
        <dl className="grid grid-cols-2 gap-3 text-sm max-w-lg">
          <dt className="text-slate-500">Firebase Project</dt>
          <dd className="font-mono text-xs text-slate-700">{import.meta.env.VITE_FIREBASE_PROJECT_ID || "dataguard-sentinel"}</dd>
          <dt className="text-slate-500">SignalR Hub</dt>
          <dd className="font-mono text-xs text-slate-700">{import.meta.env.VITE_SIGNALR_HUB_URL || "Not configured"}</dd>
          <dt className="text-slate-500">App Version</dt>
          <dd className="text-slate-700">{import.meta.env.VITE_APP_VERSION || "1.0.0"}</dd>
        </dl>
      </div>

      <hr className="border-slate-200" />

      {/* Delete Data */}
      <DeleteDataSection />
    </div>
  );
}
