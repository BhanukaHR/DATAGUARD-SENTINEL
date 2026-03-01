import { useState, useRef, useEffect } from "react";
import { Bell, LogOut, User } from "lucide-react";
import { useAuthStore } from "../../store/auth-store";
import { useAlertStore } from "../../store/alert-store";
import { authService } from "../../services/auth-service";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { ConnectionMode } from "../../hooks/useSignalR";

interface HeaderProps {
  isConnected: boolean;
  mode: ConnectionMode;
}

export function Header({ isConnected, mode }: HeaderProps) {
  const { admin, clearAuth } = useAuthStore();
  const { liveAlerts, unreadCount, markAllRead } = useAlertStore();
  const [showAlerts, setShowAlerts] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const alertRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (alertRef.current && !alertRef.current.contains(e.target as Node)) setShowAlerts(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    clearAuth();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Left: Title + connection status */}
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-slate-900">Admin Dashboard</h2>
        <span
          className={`flex items-center gap-1 text-xs ${
            isConnected
              ? mode === "signalr"
                ? "text-green-600"
                : "text-blue-600"
              : "text-slate-400"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isConnected
                ? mode === "signalr"
                  ? "bg-green-500"
                  : "bg-blue-500"
                : "bg-slate-300"
            }`}
          />
          {!isConnected
            ? "Disconnected"
            : mode === "signalr"
            ? "Live (SignalR)"
            : "Live (Firestore)"}
        </span>
      </div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative" ref={alertRef}>
          <button
            onClick={() => { setShowAlerts(!showAlerts); setShowProfile(false); }}
            className="relative p-2 rounded-md hover:bg-slate-100 transition-colors"
          >
            <Bell className="h-4 w-4 text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-medium px-1 py-0.5 rounded-full min-w-[16px] text-center leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {showAlerts && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                <span className="text-xs font-medium text-slate-700">Recent Alerts</span>
                <button onClick={markAllRead} className="text-xs text-blue-500 hover:underline">
                  Mark all read
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {liveAlerts.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No recent alerts</p>
                ) : (
                  liveAlerts.slice(0, 10).map((alert, i) => (
                    <button
                      key={i}
                      onClick={() => { navigate(`/alerts/${alert.alertId}`); setShowAlerts(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50"
                    >
                      <p className="text-xs font-medium text-slate-800 truncate">{alert.title}</p>
                      <p className="text-[11px] text-slate-500 truncate">{alert.message}</p>
                    </button>
                  ))
                )}
              </div>
              <div className="px-4 py-2 border-t border-slate-100">
                <button
                  onClick={() => { navigate("/alerts"); setShowAlerts(false); }}
                  className="text-xs text-blue-500 hover:underline w-full text-center"
                >
                  View all alerts
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setShowProfile(!showProfile); setShowAlerts(false); }}
            className="flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
          >
            <div className="h-7 w-7 bg-slate-200 rounded-full flex items-center justify-center">
              <User className="h-3.5 w-3.5 text-slate-600" />
            </div>
            <span className="text-xs text-slate-700 max-w-[100px] truncate hidden sm:inline">
              {admin?.username || admin?.email || "Admin"}
            </span>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-medium text-slate-800">{admin?.username || "Admin"}</p>
                <p className="text-[11px] text-slate-500 truncate">{admin?.email}</p>
              </div>
              <button
                onClick={() => { navigate("/settings"); setShowProfile(false); }}
                className="w-full text-left px-4 py-2 text-xs text-slate-600 hover:bg-slate-50"
              >
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="h-3 w-3" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
