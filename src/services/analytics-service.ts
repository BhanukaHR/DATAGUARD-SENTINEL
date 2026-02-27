import { collection, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore";
import { db } from "../config/firebase";

export const analyticsService = {
  async getUploadVolumeTrend(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const q = query(
      collection(db, "uploadEvents"),
      where("timestamp", ">=", Timestamp.fromDate(startDate)),
      orderBy("timestamp", "asc")
    );
    const snapshot = await getDocs(q);
    const events = snapshot.docs.map((d) => d.data());

    const grouped: Record<string, { total: number; blocked: number }> = {};
    events.forEach((e) => {
      const date = new Date(e.timestamp?.seconds ? e.timestamp.seconds * 1000 : e.timestamp).toISOString().split("T")[0];
      if (!grouped[date]) grouped[date] = { total: 0, blocked: 0 };
      grouped[date].total++;
      if (e.isBlocked) grouped[date].blocked++;
    });

    return Object.entries(grouped).map(([date, data]) => ({ date, ...data }));
  },

  async getChannelBreakdown() {
    const snapshot = await getDocs(collection(db, "uploadEvents"));
    const events = snapshot.docs.map((d) => d.data());

    const grouped: Record<string, number> = {};
    events.forEach((e) => {
      const channel = e.channel || "Unknown";
      grouped[channel] = (grouped[channel] || 0) + 1;
    });

    const total = events.length || 1;
    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / total) * 100),
    }));
  },

  async getRiskDistribution() {
    const snapshot = await getDocs(collection(db, "riskProfiles"));
    const profiles = snapshot.docs.map((d) => d.data());

    const distribution = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    profiles.forEach((p) => {
      const level = p.currentRiskLevel as keyof typeof distribution;
      if (distribution[level] !== undefined) distribution[level]++;
    });

    const colors = { Low: "#22c55e", Medium: "#eab308", High: "#f97316", Critical: "#ef4444" };
    return Object.entries(distribution).map(([level, count]) => ({
      level,
      count,
      color: colors[level as keyof typeof colors],
    }));
  },

  async getSensitivityDistribution() {
    const snapshot = await getDocs(collection(db, "uploadEvents"));
    const events = snapshot.docs.map((d) => d.data());

    const grouped: Record<string, number> = {};
    events.forEach((e) => {
      const level = e.sensitivityLevel || "Unknown";
      grouped[level] = (grouped[level] || 0) + 1;
    });

    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  },

  async getTopDestinations(topN = 10) {
    const snapshot = await getDocs(collection(db, "uploadEvents"));
    const events = snapshot.docs.map((d) => d.data());

    const grouped: Record<string, number> = {};
    events.forEach((e) => {
      const domain = e.destinationDomain || "unknown";
      grouped[domain] = (grouped[domain] || 0) + 1;
    });

    return Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([domain, count]) => ({ domain, count }));
  },

  async getFileTypeDistribution() {
    const snapshot = await getDocs(collection(db, "uploadEvents"));
    const events = snapshot.docs.map((d) => d.data());

    const grouped: Record<string, number> = {};
    events.forEach((e) => {
      const cat = e.category || "Other";
      grouped[cat] = (grouped[cat] || 0) + 1;
    });

    const total = events.length || 1;
    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / total) * 100),
    }));
  },

  async getDeptRiskComparison() {
    const snapshot = await getDocs(collection(db, "riskProfiles"));
    const profiles = snapshot.docs.map((d) => d.data());

    const grouped: Record<string, { total: number; sum: number }> = {};
    profiles.forEach((p) => {
      const dept = p.department || "Unknown";
      if (!grouped[dept]) grouped[dept] = { total: 0, sum: 0 };
      grouped[dept].total++;
      grouped[dept].sum += p.behavioralRiskScore || 0;
    });

    return Object.entries(grouped).map(([dept, data]) => ({
      dept,
      avgBrs: Math.round(data.sum / data.total),
    }));
  },

  async getDashboardStats() {
    const [uploadsSnap, alertsSnap, agentsSnap, riskSnap] = await Promise.all([
      getDocs(collection(db, "uploadEvents")),
      getDocs(collection(db, "alerts")),
      getDocs(collection(db, "agents")),
      getDocs(collection(db, "riskProfiles")),
    ]);

    const uploads = uploadsSnap.docs.map((d) => d.data());
    const alerts = alertsSnap.docs.map((d) => d.data());
    const agents = agentsSnap.docs.map((d) => d.data());
    const profiles = riskSnap.docs.map((d) => d.data());

    const today = new Date().toISOString().split("T")[0];
    const todayUploads = uploads.filter((e) => {
      const ts = e.timestamp?.seconds ? new Date(e.timestamp.seconds * 1000) : new Date(e.timestamp);
      return ts.toISOString().split("T")[0] === today;
    });

    return {
      totalEvents: uploads.length,
      todayEvents: todayUploads.length,
      blockedUploads: uploads.filter((e) => e.isBlocked).length,
      criticalAlerts: alerts.filter((a) => a.type === "Critical" && !a.isResolved).length,
      unresolvedAlerts: alerts.filter((a) => !a.isResolved).length,
      activeAgents: agents.filter((a) => {
        const hb = a.lastHeartbeat?.seconds ? new Date(a.lastHeartbeat.seconds * 1000) : new Date(a.lastHeartbeat);
        return (Date.now() - hb.getTime()) / 1000 < 60;
      }).length,
      totalAgents: agents.length,
      highRiskUsers: profiles.filter((p) => (p.behavioralRiskScore || 0) >= 60).length,
      totalUsers: profiles.length,
      avgTrs: uploads.length > 0
        ? Math.round(uploads.reduce((sum, e) => sum + (e.transactionRiskScore || 0), 0) / uploads.length)
        : 0,
    };
  },

  async getTrsHistogramData() {
    const snapshot = await getDocs(collection(db, "uploadEvents"));
    const events = snapshot.docs.map((d) => d.data());

    const bins = Array.from({ length: 10 }, (_, i) => ({
      range: `${i * 10}-${i * 10 + 10}`,
      count: 0,
      binIndex: i,
    }));

    events.forEach((e) => {
      const score = e.transactionRiskScore ?? 0;
      const binIndex = Math.min(Math.floor(score / 10), 9);
      bins[binIndex].count++;
    });

    return bins;
  },

  async getBrsHistogramData() {
    const snapshot = await getDocs(collection(db, "riskProfiles"));
    const profiles = snapshot.docs.map((d) => d.data());

    const bins = Array.from({ length: 10 }, (_, i) => ({
      range: `${i * 10}-${i * 10 + 10}`,
      count: 0,
      binIndex: i,
    }));

    profiles.forEach((p) => {
      const score = p.behavioralRiskScore ?? 0;
      const binIndex = Math.min(Math.floor(score / 10), 9);
      bins[binIndex].count++;
    });

    return bins;
  },

  async getAlertSeverityBreakdown() {
    const snapshot = await getDocs(collection(db, "alerts"));
    const alerts = snapshot.docs.map((d) => d.data());

    const grouped: Record<string, number> = { Info: 0, Warning: 0, Block: 0, Critical: 0 };
    alerts.forEach((a) => {
      const type = a.type as keyof typeof grouped;
      if (grouped[type] !== undefined) grouped[type]++;
    });

    const colors: Record<string, string> = { Info: "#3b82f6", Warning: "#eab308", Block: "#f97316", Critical: "#ef4444" };
    const total = alerts.length || 1;
    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / total) * 100),
      color: colors[name],
    }));
  },

  async getBlockedVsAllowed() {
    const snapshot = await getDocs(collection(db, "uploadEvents"));
    const events = snapshot.docs.map((d) => d.data());

    const blocked = events.filter((e) => e.isBlocked).length;
    const allowed = events.length - blocked;

    return [
      { name: "Allowed", value: allowed, color: "#22c55e" },
      { name: "Blocked", value: blocked, color: "#ef4444" },
    ];
  },
};
