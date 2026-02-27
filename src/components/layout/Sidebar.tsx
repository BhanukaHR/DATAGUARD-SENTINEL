import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Bell, Upload, ClipboardList, Usb, Bot,
  Users, Monitor, ScrollText, BarChart3, Shield, Settings, Mail, FolderUp
} from "lucide-react";
import { useAlertStore } from "../../store/alert-store";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Alerts", icon: Bell, path: "/alerts", badge: true },
  { label: "Upload Events", icon: Upload, path: "/events/uploads" },
  { label: "Clipboard Events", icon: ClipboardList, path: "/events/clipboard" },
  { label: "USB Events", icon: Usb, path: "/events/usb" },
  { label: "AI App Events", icon: Bot, path: "/events/ai" },
  { label: "Email Events", icon: Mail, path: "/events/email" },
  { label: "FTP Events", icon: FolderUp, path: "/events/ftp" },
  { label: "Users", icon: Users, path: "/users" },
  { label: "Agents", icon: Monitor, path: "/agents" },
  { label: "Audit Log", icon: ScrollText, path: "/audit-log" },
  { label: "Analytics", icon: BarChart3, path: "/analytics" },
  { label: "Policy", icon: Shield, path: "/policy" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { unreadCount } = useAlertStore();

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-slate-900 text-white z-30 transition-all duration-200 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-slate-700">
        <Shield className="h-6 w-6 text-blue-400 shrink-0" />
        {!collapsed && (
          <span className="ml-2 text-sm font-semibold truncate">DataGuard Sentinel</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-2 flex flex-col gap-0.5 px-2 overflow-y-auto h-[calc(100vh-3.5rem)]">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-150 ${
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
            {item.badge && unreadCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute bottom-4 right-0 translate-x-1/2 bg-slate-700 hover:bg-slate-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs z-40"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? "→" : "←"}
      </button>
    </aside>
  );
}
