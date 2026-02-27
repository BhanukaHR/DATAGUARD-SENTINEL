import React, { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  FileSearch,
  Gauge,
  LayoutDashboard,
  LogOut,
  Shield,
  UserCog,
  Users,
  Usb,
  Clipboard,
  Bot,
  Server,
  FileText,
  Settings,
  ScrollText,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ---- Firebase client connectivity (Disabled for mock viewing) -------------
// import { auth as firebaseAuth, db } from "./firebase";
// import { collection, getDocs } from "firebase/firestore";
// import { signInWithEmailAndPassword } from "firebase/auth";

// generic hook for loading a collection; returns mock data until the
// real collection is fetched.  you can drop the mock once you have
// real documents.
function useFirestoreCollection<T>(name: string, initial: T[] = []) {
  const [data, setData] = useState<T[]>(initial);
  useEffect(() => {
    // Disabled real firestore fetch for now, returning mock data only.
    setData(initial);
  }, [name, initial]);
  return data;
}


/**
 * DataGuard Sentinel — Admin Dashboard (React SPA)
 *
 * Built directly from:
 * - ISP-09 proposal (Objective O5: centralized dashboard with real-time alerts, risk scoring, user monitoring)
 * - Admin-Dashboard-Development-Guide.md (routing structure, data model collections, report sections, security notes)
 *
 * Notes:
 * - This file is a functional UI skeleton you can paste into a Vite+React project.
 * - Replace the mock services with Firebase/SignalR integrations from your backend.
 */

// -----------------------------
// Types
// -----------------------------

type RiskLevel = "Low" | "Medium" | "High" | "Critical";

type UploadChannel =
  | "Browser"
  | "CloudSync"
  | "FTP"
  | "Email"
  | "USB"
  | "Clipboard"
  | "AI";

type Sensitivity = "Public" | "Internal" | "Confidential" | "Restricted";

type UploadEvent = {
  id: string;
  timestamp: string; // ISO
  userId: string;
  username: string;
  department?: string;
  channel: UploadChannel;
  fileName: string;
  fileType: string;
  fileSizeKb: number;
  destination: string; // domain/IP
  sensitivity: Sensitivity;
  transactionRiskScore: number; // 0-100
  isBlocked: boolean;
  reason?: string;
};

type RiskProfile = {
  id?: string;
  userId: string;
  username: string;
  employeeId?: string;
  department?: string;
  brs: number; // 0-100
  riskLevel: RiskLevel;
  totalUploads: number;
  blocked: number;
  violations: number;
  lastSeen: string; // ISO
};

type AlertItem = {
  id: string;
  timestamp: string;
  type: "Info" | "Warning" | "Block" | "Critical";
  title: string;
  userId: string;
  username: string;
  eventId?: string;
  details: string;
  status: "Open" | "Acknowledged" | "Resolved";
};

type Agent = {
  id: string;
  hostname: string;
  username: string;
  lastHeartbeat: string;
  status: "Online" | "Offline" | "Degraded";
  scanCount: number;
  version: string;
};

// -----------------------------
// Mock Data (Replace with Firestore queries + SignalR)
// -----------------------------

function isoNowMinus(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

const MOCK_RISK_PROFILES: RiskProfile[] = [
  {
    userId: "u-001",
    username: "nkbhr",
    employeeId: "EMP-1021",
    department: "Finance",
    brs: 72,
    riskLevel: "High",
    totalUploads: 124,
    blocked: 6,
    violations: 11,
    lastSeen: isoNowMinus(2),
  },
  {
    userId: "u-002",
    username: "ulkh",
    employeeId: "EMP-1140",
    department: "IT",
    brs: 38,
    riskLevel: "Medium",
    totalUploads: 88,
    blocked: 2,
    violations: 3,
    lastSeen: isoNowMinus(12),
  },
  {
    userId: "u-003",
    username: "analyst01",
    employeeId: "EMP-0902",
    department: "R&D",
    brs: 15,
    riskLevel: "Low",
    totalUploads: 41,
    blocked: 0,
    violations: 0,
    lastSeen: isoNowMinus(55),
  },
  {
    userId: "u-004",
    username: "temp.contractor",
    employeeId: "CTR-018",
    department: "Operations",
    brs: 91,
    riskLevel: "Critical",
    totalUploads: 206,
    blocked: 18,
    violations: 27,
    lastSeen: isoNowMinus(1),
  },
];

const MOCK_UPLOAD_EVENTS: UploadEvent[] = [
  {
    id: "ev-901",
    timestamp: isoNowMinus(3),
    userId: "u-004",
    username: "temp.contractor",
    department: "Operations",
    channel: "Browser",
    fileName: "client_list_q1.xlsx",
    fileType: "XLSX",
    fileSizeKb: 980,
    destination: "drive.google.com",
    sensitivity: "Confidential",
    transactionRiskScore: 95,
    isBlocked: true,
    reason: "Untrusted destination + confidential file",
  },
  {
    id: "ev-902",
    timestamp: isoNowMinus(8),
    userId: "u-001",
    username: "nkbhr",
    department: "Finance",
    channel: "Email",
    fileName: "payslips.zip",
    fileType: "ZIP",
    fileSizeKb: 4120,
    destination: "mail.yahoo.com",
    sensitivity: "Restricted",
    transactionRiskScore: 88,
    isBlocked: true,
    reason: "Restricted data via personal email",
  },
  {
    id: "ev-903",
    timestamp: isoNowMinus(20),
    userId: "u-002",
    username: "ulkh",
    department: "IT",
    channel: "CloudSync",
    fileName: "api_keys.txt",
    fileType: "TXT",
    fileSizeKb: 6,
    destination: "dropbox.com",
    sensitivity: "Confidential",
    transactionRiskScore: 62,
    isBlocked: false,
    reason: "Flagged for review",
  },
  {
    id: "ev-904",
    timestamp: isoNowMinus(40),
    userId: "u-003",
    username: "analyst01",
    department: "R&D",
    channel: "AI",
    fileName: "design_notes.docx",
    fileType: "DOCX",
    fileSizeKb: 220,
    destination: "chat.openai.com",
    sensitivity: "Internal",
    transactionRiskScore: 28,
    isBlocked: false,
  },
];

const MOCK_ALERTS: AlertItem[] = [
  {
    id: "al-101",
    timestamp: isoNowMinus(3),
    type: "Critical",
    title: "Blocked confidential upload to Google Drive",
    userId: "u-004",
    username: "temp.contractor",
    eventId: "ev-901",
    details: "Confidential spreadsheet attempted to upload to an untrusted destination.",
    status: "Open",
  },
  {
    id: "al-102",
    timestamp: isoNowMinus(8),
    type: "Block",
    title: "Restricted data attempt via personal email",
    userId: "u-001",
    username: "nkbhr",
    eventId: "ev-902",
    details: "ZIP containing payslip data attempted via personal email domain.",
    status: "Acknowledged",
  },
  {
    id: "al-103",
    timestamp: isoNowMinus(20),
    type: "Warning",
    title: "Possible secret exposure via cloud sync",
    userId: "u-002",
    username: "ulkh",
    eventId: "ev-903",
    details: "Potential API key file synced to Dropbox.",
    status: "Open",
  },
];

const MOCK_AGENTS: Agent[] = [
  {
    id: "ag-001",
    hostname: "FIN-LT-22",
    username: "nkbhr",
    lastHeartbeat: isoNowMinus(1),
    status: "Online",
    scanCount: 891,
    version: "1.0.0",
  },
  {
    id: "ag-002",
    hostname: "IT-WS-07",
    username: "ulkh",
    lastHeartbeat: isoNowMinus(3),
    status: "Online",
    scanCount: 1203,
    version: "1.0.0",
  },
  {
    id: "ag-003",
    hostname: "OPS-CTR-03",
    username: "temp.contractor",
    lastHeartbeat: isoNowMinus(85),
    status: "Offline",
    scanCount: 432,
    version: "0.9.9",
  },
];

// -----------------------------
// Utils
// -----------------------------

function riskBadge(level: RiskLevel) {
  const base = "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium";
  const map: Record<RiskLevel, string> = {
    Low: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    Medium: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
    High: "bg-orange-50 text-orange-800 ring-1 ring-orange-200",
    Critical: "bg-red-50 text-red-700 ring-1 ring-red-200",
  };
  return `${base} ${map[level]}`;
}

function alertBadge(type: AlertItem["type"]) {
  const base = "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium";
  const map: Record<AlertItem["type"], string> = {
    Info: "bg-slate-100 text-slate-700",
    Warning: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
    Block: "bg-orange-50 text-orange-800 ring-1 ring-orange-200",
    Critical: "bg-red-50 text-red-700 ring-1 ring-red-200",
  };
  return `${base} ${map[type]}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function levelFromBRS(brs: number): RiskLevel {
  if (brs >= 85) return "Critical";
  if (brs >= 60) return "High";
  if (brs >= 30) return "Medium";
  return "Low";
}

// -----------------------------
// Simple Auth (UI-only stub)
// -----------------------------

type AuthState = { isAuthed: boolean; adminEmail?: string };

function useAuth() {
  const [auth, setAuth] = useState<AuthState>(() => {
    const raw = localStorage.getItem("dg_auth");
    return raw ? (JSON.parse(raw) as AuthState) : { isAuthed: false };
  });

  const login = (email: string) => {
    // Fake login logic since Firebase is disabled
    console.log("Mock login triggered for", email);
    const next = { isAuthed: true, adminEmail: email };
    localStorage.setItem("dg_auth", JSON.stringify(next));
    setAuth(next);
  };

  const logout = () => {
    // firebaseAuth.signOut?.(); // Disabled
    localStorage.removeItem("dg_auth");
    setAuth({ isAuthed: false });
  };

  return { auth, login, logout };
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { auth } = useAuth();
  const loc = useLocation();
  if (!auth.isAuthed) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  return <>{children}</>;
}

// -----------------------------
// Layout
// -----------------------------

function AppShell({ children }: { children: React.ReactNode }) {
  const { auth, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <aside className="w-72 border-r border-slate-200 bg-white min-h-screen sticky top-0">
          <div className="p-5 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">DataGuard Sentinel</div>
                <div className="text-xs text-slate-500">Admin Dashboard</div>
              </div>
            </div>
          </div>

          <nav className="p-3 space-y-1">
            <SideLink to="/" icon={<LayoutDashboard className="h-4 w-4" />} label="Overview" />
            <SideLink to="/alerts" icon={<AlertTriangle className="h-4 w-4" />} label="Alerts" />
            <SideLink to="/users" icon={<Users className="h-4 w-4" />} label="User Risk Profiles" />
            <SideLink to="/events" icon={<FileSearch className="h-4 w-4" />} label="Upload Events" />
            <SideLink to="/clipboard" icon={<Clipboard className="h-4 w-4" />} label="Clipboard Events" />
            <SideLink to="/usb" icon={<Usb className="h-4 w-4" />} label="USB Events" />
            <SideLink to="/ai" icon={<Bot className="h-4 w-4" />} label="AI App Events" />
            <SideLink to="/agents" icon={<Server className="h-4 w-4" />} label="Agent Health" />
            <SideLink to="/reports" icon={<FileText className="h-4 w-4" />} label="Reports" />
            <SideLink to="/audit" icon={<ScrollText className="h-4 w-4" />} label="Audit Logs" />
            <SideLink to="/settings" icon={<Settings className="h-4 w-4" />} label="Settings & Policies" />
          </nav>

          <div className="mt-auto p-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="text-xs">
                <div className="text-slate-500">Signed in</div>
                <div className="font-medium text-slate-900 truncate max-w-[160px]">
                  {auth.adminEmail || "admin"}
                </div>
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <TopBar />
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

function TopBar() {
  const [q, setQ] = useState("");
  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-900">
          <Activity className="h-5 w-5" />
          <span className="font-semibold">Real-time Monitoring</span>
          <span className="text-xs text-slate-500">(SignalR stream)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search users, domains, files…"
              className="w-[320px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            />
            <div className="absolute right-2 top-2.5 text-slate-400">
              <FileSearch className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xs text-slate-500">Refresh: 30s</div>
        </div>
      </div>
    </div>
  );
}

function SideLink({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${isActive
          ? "bg-slate-900 text-white"
          : "text-slate-700 hover:bg-slate-100"
        }`
      }
    >
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

// -----------------------------
// Pages
// -----------------------------

function OverviewPage() {
  // pull data from Firestore; fall back to the mock arrays while
  // waiting for the first fetch or if running offline.
  const profiles = useFirestoreCollection<RiskProfile>("riskProfiles", MOCK_RISK_PROFILES);
  const events = useFirestoreCollection<UploadEvent>("uploadEvents", MOCK_UPLOAD_EVENTS);
  const alerts = useFirestoreCollection<AlertItem>("alerts", MOCK_ALERTS);
  const agents = useFirestoreCollection<Agent>("agents", MOCK_AGENTS);

  const kpis = useMemo(() => {
    const totalEvents = events.length;
    const blocked = events.filter((e) => e.isBlocked).length;
    const avgTRS = totalEvents ? events.reduce((a, b) => a + b.transactionRiskScore, 0) / totalEvents : 0;
    const critical = alerts.filter((a) => a.type === "Critical").length;
    const highRiskUsers = profiles.filter((p) => p.brs >= 60).length;
    const activeAgents = agents.filter((a) => a.status === "Online").length;
    return {
      totalEvents,
      blocked,
      blockedPct: totalEvents ? Math.round((blocked / totalEvents) * 100) : 0,
      avgTRS: Math.round(avgTRS),
      critical,
      highRiskUsers,
      activeAgents,
    };
  }, [profiles, events, alerts, agents]);

  const trsDist = useMemo(() => {
    const bins = [
      { label: "0-10", v: 0 },
      { label: "11-20", v: 0 },
      { label: "21-30", v: 0 },
      { label: "31-40", v: 0 },
      { label: "41-50", v: 0 },
      { label: "51-60", v: 0 },
      { label: "61-70", v: 0 },
      { label: "71-80", v: 0 },
      { label: "81-90", v: 0 },
      { label: "91-100", v: 0 },
    ];
    for (const e of events) {
      const s = clamp(Math.floor(e.transactionRiskScore / 10), 0, 9);
      bins[s].v += 1;
    }
    return bins;
  }, [events]);

  const brsDist = useMemo(() => {
    const bins = [
      { label: "0-10", v: 0 },
      { label: "11-20", v: 0 },
      { label: "21-30", v: 0 },
      { label: "31-40", v: 0 },
      { label: "41-50", v: 0 },
      { label: "51-60", v: 0 },
      { label: "61-70", v: 0 },
      { label: "71-80", v: 0 },
      { label: "81-90", v: 0 },
      { label: "91-100", v: 0 },
    ];
    for (const p of profiles) {
      const s = clamp(Math.floor(p.brs / 10), 0, 9);
      bins[s].v += 1;
    }
    return bins;
  }, [profiles]);

  const channelAvg = useMemo(() => {
    const map: Record<string, { sum: number; n: number }> = {};
    for (const e of events) {
      map[e.channel] = map[e.channel] || { sum: 0, n: 0 };
      map[e.channel].sum += e.transactionRiskScore;
      map[e.channel].n += 1;
    }
    return Object.entries(map)
      .map(([k, v]) => ({ channel: k, avg: Math.round(v.sum / v.n) }))
      .sort((a, b) => b.avg - a.avg);
  }, [events]);

  const userRiskPie = useMemo(() => {
    const buckets: Record<RiskLevel, number> = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    for (const p of profiles) buckets[p.riskLevel] += 1;
    return (Object.keys(buckets) as RiskLevel[]).map((k) => ({ name: k, value: buckets[k] }));
  }, [profiles]);

  const topTRSEvents = useMemo(() => [...events].sort((a, b) => b.transactionRiskScore - a.transactionRiskScore).slice(0, 5), [events]);

  const volumeSeries = useMemo(() => {
    // Mock daily series for chart
    const base = [
      { day: "Mon", uploads: 24, blocked: 2 },
      { day: "Tue", uploads: 30, blocked: 3 },
      { day: "Wed", uploads: 22, blocked: 1 },
      { day: "Thu", uploads: 38, blocked: 6 },
      { day: "Fri", uploads: 41, blocked: 4 },
      { day: "Sat", uploads: 9, blocked: 0 },
      { day: "Sun", uploads: 12, blocked: 1 },
    ];
    return base;
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Overview</h1>
        <p className="text-sm text-slate-600">Organizational risk posture, TRS/BRS analytics, and real-time insights.</p>
      </div>

      {/* KPI Cards (Executive Summary) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
        <KpiCard label="Total events" value={kpis.totalEvents} icon={<BarChart3 className="h-4 w-4" />} />
        <KpiCard label="Events blocked" value={`${kpis.blocked} (${kpis.blockedPct}%)`} icon={<Shield className="h-4 w-4" />} />
        <KpiCard label="Avg TRS" value={kpis.avgTRS} icon={<Gauge className="h-4 w-4" />} />
        <KpiCard label="Critical alerts" value={kpis.critical} icon={<AlertTriangle className="h-4 w-4" />} />
        <KpiCard label="High-risk users" value={kpis.highRiskUsers} icon={<Users className="h-4 w-4" />} />
        <KpiCard label="Active agents" value={kpis.activeAgents} icon={<Server className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card title="Upload Volume" subtitle="Daily uploads and blocked events">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="uploads" />
                <Area type="monotone" dataKey="blocked" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Avg TRS by Channel" subtitle="Higher = riskier channels">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelAvg} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="channel" width={90} />
                <Tooltip />
                <Bar dataKey="avg" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="User Risk Levels" subtitle="BRS buckets across all users">
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Pie data={userRiskPie} dataKey="value" nameKey="name" outerRadius={90} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card title="TRS Distribution" subtitle="0–100 bins">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trsDist}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="v" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="BRS Distribution" subtitle="User behavioral risk score bins">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brsDist}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="v" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Top 5 Highest TRS Events" subtitle="Quick investigation queue">
        <DataTable
          columns={[
            { key: "timestamp", title: "Time", render: (r: UploadEvent) => <span className="text-xs">{formatDate(r.timestamp)}</span> },
            { key: "username", title: "User" },
            { key: "channel", title: "Channel" },
            { key: "destination", title: "Destination" },
            { key: "fileName", title: "File" },
            {
              key: "transactionRiskScore",
              title: "TRS",
              render: (r: UploadEvent) => (
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-slate-100 text-slate-800">
                  {r.transactionRiskScore}
                </span>
              ),
            },
            {
              key: "isBlocked",
              title: "Blocked",
              render: (r: UploadEvent) => (
                <span className={r.isBlocked ? "text-red-700" : "text-emerald-700"}>{r.isBlocked ? "Yes" : "No"}</span>
              ),
            },
          ]}
          rows={topTRSEvents}
        />
      </Card>
    </div>
  );
}

function AlertsPage() {
  const [status, setStatus] = useState<AlertItem["status"] | "All">("All");
  const [severity, setSeverity] = useState<AlertItem["type"] | "All">("All");

  const allAlerts = useFirestoreCollection<AlertItem>("alerts", MOCK_ALERTS);
  const rows = useMemo(() => {
    return allAlerts
      .filter((a) => (status === "All" ? true : a.status === status))
      .filter((a) => (severity === "All" ? true : a.type === severity));
  }, [allAlerts, status, severity]);

  return (
    <div className="space-y-6">
      <Header title="Alerts" desc="Real-time alerts for high-risk uploads and repeat offender escalations." icon={<AlertTriangle className="h-5 w-5" />}>
        <div className="flex gap-2">
          <Select value={status} onChange={(v) => setStatus(v as any)} options={["All", "Open", "Acknowledged", "Resolved"]} />
          <Select value={severity} onChange={(v) => setSeverity(v as any)} options={["All", "Info", "Warning", "Block", "Critical"]} />
        </div>
      </Header>

      <Card title="Alert Feed" subtitle="Acknowledge and resolve alerts (hook to Firestore + auditLogs)">
        <DataTable
          columns={[
            { key: "timestamp", title: "Time", render: (r: AlertItem) => <span className="text-xs">{formatDate(r.timestamp)}</span> },
            {
              key: "type",
              title: "Severity",
              render: (r: AlertItem) => <span className={alertBadge(r.type)}>{r.type}</span>,
            },
            { key: "title", title: "Title" },
            { key: "username", title: "User" },
            {
              key: "status",
              title: "Status",
              render: (r: AlertItem) => (
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-slate-100 text-slate-800">
                  {r.status}
                </span>
              ),
            },
            {
              key: "actions",
              title: "Actions",
              render: () => (
                <div className="flex gap-2">
                  <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50">View</button>
                  <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50">Acknowledge</button>
                  <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50">Resolve</button>
                </div>
              ),
            },
          ]}
          rows={rows}
        />
      </Card>
    </div>
  );
}

function UsersPage() {
  const [minBrs, setMinBrs] = useState(0);
  const profiles = useFirestoreCollection<RiskProfile>("riskProfiles", MOCK_RISK_PROFILES);
  const rows = useMemo(() => {
    return [...profiles]
      .map((p) => ({ ...p, riskLevel: levelFromBRS(p.brs) }))
      .filter((p) => p.brs >= minBrs)
      .sort((a, b) => b.brs - a.brs);
  }, [profiles, minBrs]);

  return (
    <div className="space-y-6">
      <Header title="User Risk Profiles" desc="BRS-based monitoring, violations, and repeat offender flagging." icon={<Users className="h-5 w-5" />}>
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-600">Min BRS</label>
          <input
            type="range"
            min={0}
            max={100}
            value={minBrs}
            onChange={(e) => setMinBrs(Number(e.target.value))}
            className="w-40"
          />
          <span className="text-sm font-medium text-slate-900">{minBrs}</span>
        </div>
      </Header>

      <Card title="All Users" subtitle="Sorted by BRS (descending)">
        <DataTable
          columns={[
            { key: "username", title: "Username" },
            { key: "employeeId", title: "Employee ID" },
            { key: "department", title: "Department" },
            {
              key: "brs",
              title: "BRS",
              render: (r: RiskProfile) => (
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-slate-100 text-slate-800">
                  {r.brs}
                </span>
              ),
            },
            {
              key: "riskLevel",
              title: "Risk Level",
              render: (r: RiskProfile) => <span className={riskBadge(r.riskLevel)}>{r.riskLevel}</span>,
            },
            { key: "totalUploads", title: "Total Uploads" },
            { key: "blocked", title: "Blocked" },
            { key: "violations", title: "Violations" },
            { key: "lastSeen", title: "Last Seen", render: (r: RiskProfile) => <span className="text-xs">{formatDate(r.lastSeen)}</span> },
            {
              key: "actions",
              title: "Actions",
              render: () => (
                <div className="flex gap-2">
                  <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50">View Profile</button>
                  <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50">Investigate</button>
                </div>
              ),
            },
          ]}
          rows={rows}
        />
      </Card>
    </div>
  );
}

function UploadEventsPage() {
  const [onlyBlocked, setOnlyBlocked] = useState(false);
  const [channel, setChannel] = useState<UploadChannel | "All">("All");

  const events = useFirestoreCollection<UploadEvent>("uploadEvents", MOCK_UPLOAD_EVENTS);
  const rows = useMemo(() => {
    return events
      .filter((e) => (onlyBlocked ? e.isBlocked : true))
      .filter((e) => (channel === "All" ? true : e.channel === channel))
      .sort((a, b) => b.transactionRiskScore - a.transactionRiskScore);
  }, [events, onlyBlocked, channel]);

  return (
    <div className="space-y-6">
      <Header title="Upload Events" desc="Searchable/filterable event table with details and blocking reason." icon={<FileSearch className="h-5 w-5" />}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOnlyBlocked((v) => !v)}
            className={`rounded-lg px-3 py-2 text-sm border ${onlyBlocked ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 hover:bg-slate-50"}`}
          >
            {onlyBlocked ? "Showing: Blocked" : "Filter: Blocked"}
          </button>
          <Select value={channel} onChange={(v) => setChannel(v as any)} options={["All", "Browser", "CloudSync", "FTP", "Email", "USB", "Clipboard", "AI"]} />
        </div>
      </Header>

      <Card title="Event Viewer" subtitle="Click a row to open an investigation drawer (connect to Firestore)">
        <DataTable
          columns={[
            { key: "timestamp", title: "Time", render: (r: UploadEvent) => <span className="text-xs">{formatDate(r.timestamp)}</span> },
            { key: "username", title: "User" },
            { key: "department", title: "Dept" },
            { key: "channel", title: "Channel" },
            { key: "destination", title: "Destination" },
            { key: "fileName", title: "File" },
            { key: "sensitivity", title: "Sensitivity" },
            {
              key: "transactionRiskScore",
              title: "TRS",
              render: (r: UploadEvent) => (
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-slate-100 text-slate-800">
                  {r.transactionRiskScore}
                </span>
              ),
            },
            {
              key: "isBlocked",
              title: "Blocked",
              render: (r: UploadEvent) => (
                <span className={r.isBlocked ? "text-red-700" : "text-emerald-700"}>{r.isBlocked ? "Yes" : "No"}</span>
              ),
            },
            { key: "reason", title: "Reason" },
          ]}
          rows={rows}
        />
      </Card>
    </div>
  );
}

function ClipboardEventsPage() {
  return (
    <div className="space-y-6">
      <Header title="Clipboard Events" desc="Monitor sensitive clipboard activity and AI-targeted pastes." icon={<Clipboard className="h-5 w-5" />} />
      <Card title="Coming next" subtitle="Hook to clipboardEvents collection + policy patterns">
        <Placeholder />
      </Card>
    </div>
  );
}

function UsbEventsPage() {
  return (
    <div className="space-y-6">
      <Header title="USB Events" desc="Monitor removable media transfers and blocks." icon={<Usb className="h-5 w-5" />} />
      <Card title="Coming next" subtitle="Hook to usbEvents / removableMediaEvents collection">
        <Placeholder />
      </Card>
    </div>
  );
}

function AiEventsPage() {
  return (
    <div className="space-y-6">
      <Header title="AI Application Events" desc="Detect AI applications and related risky events." icon={<Bot className="h-5 w-5" />} />
      <Card title="Coming next" subtitle="Hook to aiApplicationEvents collection">
        <Placeholder />
      </Card>
    </div>
  );
}

function AgentsPage() {
  const agents = useFirestoreCollection<Agent>("agents", MOCK_AGENTS);
  const rows = useMemo(() => [...agents].sort((a, b) => (a.status === b.status ? 0 : a.status === "Online" ? -1 : 1)), [agents]);
  return (
    <div className="space-y-6">
      <Header title="Agent Health" desc="Heartbeat monitoring and device status." icon={<Server className="h-5 w-5" />} />
      <Card title="Agents" subtitle="Active agents = recent heartbeat (per timeout policy)">
        <DataTable
          columns={[
            { key: "hostname", title: "Host" },
            { key: "username", title: "User" },
            { key: "status", title: "Status" },
            { key: "version", title: "Version" },
            { key: "scanCount", title: "Scan Count" },
            { key: "lastHeartbeat", title: "Last Heartbeat", render: (r: Agent) => <span className="text-xs">{formatDate(r.lastHeartbeat)}</span> },
            {
              key: "actions",
              title: "Actions",
              render: () => (
                <div className="flex gap-2">
                  <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50">View</button>
                  <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50">Ping</button>
                </div>
              ),
            },
          ]}
          rows={rows}
        />
      </Card>
    </div>
  );
}

function ReportsPage() {
  return (
    <div className="space-y-6">
      <Header title="Reports" desc="Monthly reports with customizable sections (PDF/CSV)." icon={<FileText className="h-5 w-5" />} />
      <Card title="Report Builder" subtitle="Match the report sections spec from your guide">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-3">
            <div className="text-sm font-medium text-slate-900">Period</div>
            <div className="flex gap-2">
              <input type="month" defaultValue="2026-02" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <button className="rounded-lg bg-slate-900 text-white px-3 py-2 text-sm">Preview</button>
            </div>

            <div className="text-sm font-medium text-slate-900 mt-4">Sections</div>
            <div className="space-y-2">
              {[
                "Executive Summary",
                "Risk Score Overview",
                "User Risk Profiles",
                "Alert Summary",
                "Upload Events Analysis",
                "Clipboard Events Analysis",
                "USB Events Analysis",
                "AI Application Events",
                "Agent Health Report",
                "Audit Log Summary",
              ].map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" defaultChecked className="rounded" />
                  {s}
                </label>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">Generate CSV</button>
              <button className="rounded-lg bg-slate-900 text-white px-3 py-2 text-sm">Generate PDF</button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6">
              <div className="text-sm font-medium text-slate-900">Preview</div>
              <p className="text-sm text-slate-600 mt-1">
                Render a preview component here and export to PDF/CSV using your report-service.
              </p>
              <div className="mt-4">
                <Placeholder />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <Header title="Audit Logs" desc="Immutable audit trail (no update/delete) for admin actions." icon={<ScrollText className="h-5 w-5" />} />
      <Card title="Coming next" subtitle="Hook to auditLogs collection with filters + export">
        <Placeholder />
      </Card>
    </div>
  );
}

function SettingsPoliciesPage() {
  return (
    <div className="space-y-6">
      <Header title="Settings & Policies" desc="Admin management, password rules, policy controls." icon={<UserCog className="h-5 w-5" />} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card title="Admin Account" subtitle="Change password UI (validate complexity rules)">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Current password" type="password" />
              <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="New password" type="password" />
            </div>
            <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Confirm new password" type="password" />
            <button className="rounded-lg bg-slate-900 text-white px-3 py-2 text-sm">Update password</button>
            <ul className="text-xs text-slate-600 list-disc pl-5">
              <li>Min 8 chars, upper+lower, number, special character</li>
              <li>Cannot match current password</li>
              <li>Verify current password</li>
            </ul>
          </div>
        </Card>

        <Card title="Policy Controls" subtitle="Destination trust list, sensitivity rules, thresholds">
          <div className="space-y-3">
            <div className="text-sm font-medium text-slate-900">Thresholds</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="text-sm text-slate-700">
                TRS Block Threshold
                <input type="number" defaultValue={85} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </label>
              <label className="text-sm text-slate-700">
                BRS High-Risk Threshold
                <input type="number" defaultValue={60} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </label>
            </div>

            <div className="text-sm font-medium text-slate-900 mt-2">Trusted Destinations</div>
            <div className="flex gap-2">
              <input className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Add domain (e.g., onedrive.live.com)" />
              <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">Add</button>
            </div>

            <div className="text-sm font-medium text-slate-900 mt-2">Blocked Destinations</div>
            <div className="flex gap-2">
              <input className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Add blocked domain" />
              <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">Add</button>
            </div>

            <button className="rounded-lg bg-slate-900 text-white px-3 py-2 text-sm">Save policy</button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function LoginPage() {
  const { auth, login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as any;
  const [email, setEmail] = useState("admin@dataguard.com");
  const [password, setPassword] = useState("password");

  useEffect(() => {
    if (auth.isAuthed) nav(loc?.state?.from || "/", { replace: true });
  }, [auth.isAuthed, nav, loc?.state?.from]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">DataGuard Sentinel</div>
            <div className="text-xs text-slate-500">Admin Sign-in</div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <label className="text-sm text-slate-700">
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="admin@company.com"
            />
          </label>
          <label className="text-sm text-slate-700">
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              type="password"
              placeholder="••••••••"
            />
          </label>
          <button
            onClick={() => login(email)}
            className="w-full rounded-lg bg-slate-900 border border-transparent shadow-sm hover:bg-slate-800 text-white font-medium px-4 py-2.5 text-sm transition-colors duration-200"
          >
            Sign in
          </button>
          <p className="text-xs text-slate-500">Hook this to Firebase Auth + server-side admin verification.</p>
        </div>
      </div>
    </div>
  );
}

// -----------------------------
// UI primitives
// -----------------------------

function Header({
  title,
  desc,
  icon,
  children,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <div className="text-slate-900">{icon}</div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        </div>
        <p className="text-sm text-slate-600 mt-1">{desc}</p>
      </div>
      {children ? <div className="flex items-center gap-2">{children}</div> : null}
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-5 border-b border-slate-200">
        <div className="font-semibold text-slate-900">{title}</div>
        {subtitle ? <div className="text-sm text-slate-600 mt-1">{subtitle}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function KpiCard({ label, value, icon }: { label: string; value: any; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-slate-500">{label}</div>
          <div className="text-xl font-semibold text-slate-900 mt-1">{value}</div>
        </div>
        <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">{icon}</div>
      </div>
    </div>
  );
}

function Placeholder() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
      Replace this placeholder with Firestore queries, charts, filters, and investigation drawers.
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

type Column<T> = { key: string; title: string; render?: (row: T) => React.ReactNode };

function DataTable<T extends { id?: string }>({
  columns,
  rows,
}: {
  columns: Column<T>[];
  rows: T[];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className="px-4 py-3 text-left text-xs font-semibold text-slate-700"
              >
                {c.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {rows.map((r, idx) => (
            <tr key={(r.id as any) || idx} className="hover:bg-slate-50">
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3 text-sm text-slate-800 whitespace-nowrap">
                  {c.render ? c.render(r) : (r as any)[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// -----------------------------
// App Entry
// -----------------------------

function AuthedApp() {
  return (
    <RequireAuth>
      <AppShell>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/events" element={<UploadEventsPage />} />
          <Route path="/clipboard" element={<ClipboardEventsPage />} />
          <Route path="/usb" element={<UsbEventsPage />} />
          <Route path="/ai" element={<AiEventsPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/audit" element={<AuditLogsPage />} />
          <Route path="/settings" element={<SettingsPoliciesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </RequireAuth>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<AuthedApp />} />
      </Routes>
    </BrowserRouter>
  );
}
