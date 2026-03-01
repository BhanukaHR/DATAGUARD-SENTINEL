import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useSignalR } from "../../hooks/useSignalR";
import { useFirestoreRealtime } from "../../hooks/useFirestoreRealtime";

export function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isConnected, mode } = useSignalR();

  // Activate Firestore real-time listeners when SignalR is not available
  useFirestoreRealtime();

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className={`transition-all duration-200 ${sidebarCollapsed ? "ml-16" : "ml-56"}`}>
        <Header isConnected={isConnected} mode={mode} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
