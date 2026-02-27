import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "../services/analytics-service";
import { alertService } from "../services/alert-service";
import { agentService } from "../services/agent-service";
import { StatCard } from "../components/dashboard/StatCard";
import { AlertFeed } from "../components/dashboard/AlertFeed";
import { TopRiskUsers } from "../components/dashboard/TopRiskUsers";
import { AgentStatusGrid } from "../components/dashboard/AgentStatusGrid";
import { UploadTrendChart } from "../components/charts/UploadTrendChart";
import { ChannelPieChart } from "../components/charts/ChannelPieChart";
import { RiskDistributionChart } from "../components/charts/RiskDistributionChart";
import { BlockedAllowedChart } from "../components/charts/BlockedAllowedChart";
import { SensitivityBarChart } from "../components/charts/SensitivityBarChart";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { Activity, MonitorCheck, AlertTriangle, ShieldOff, Users, BarChart3 } from "lucide-react";
import type { UserRiskProfile } from "../types/user-risk-profile";

export function DashboardPage() {
  const [trendPeriod, setTrendPeriod] = useState<"7d" | "30d" | "90d">("7d");

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: () => analyticsService.getDashboardStats(),
    refetchInterval: 30000,
  });

  const { data: riskProfiles } = useQuery<UserRiskProfile[]>({
    queryKey: ["riskProfiles"],
    queryFn: async () => {
      const { getDocs, collection } = await import("firebase/firestore");
      const { db } = await import("../config/firebase");
      const snap = await getDocs(collection(db, "riskProfiles"));
      return snap.docs.map((d) => ({ userId: d.id, ...d.data() })) as unknown as UserRiskProfile[];
    },
  });

  const { data: alertStats } = useQuery({
    queryKey: ["alertStats"],
    queryFn: () => alertService.getAlertStats(),
  });

  const { data: agentStats } = useQuery({
    queryKey: ["agentStats"],
    queryFn: () => agentService.getAgentStats(),
  });

  const { data: trendData } = useQuery({
    queryKey: ["uploadTrend", trendPeriod],
    queryFn: () => analyticsService.getUploadVolumeTrend(trendPeriod === "7d" ? 7 : trendPeriod === "30d" ? 30 : 90),
  });

  const { data: channelData } = useQuery({
    queryKey: ["channelBreakdown"],
    queryFn: () => analyticsService.getChannelBreakdown(),
  });

  const { data: riskData } = useQuery({
    queryKey: ["riskDistribution"],
    queryFn: () => analyticsService.getRiskDistribution(),
  });

  const { data: sensitivityData } = useQuery({
    queryKey: ["sensitivityDistribution"],
    queryFn: () => analyticsService.getSensitivityDistribution(),
  });

  const { data: blockedAllowed } = useQuery({
    queryKey: ["blockedAllowed"],
    queryFn: () => analyticsService.getBlockedVsAllowed(),
  });

  const { data: agents } = useQuery({
    queryKey: ["agents"],
    queryFn: () => agentService.getAllAgents(),
    refetchInterval: 30000,
  });

  if (statsLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Events"
          value={stats?.totalEvents ?? 0}
          subtitle="All time"
          icon={Activity}
          color="blue"
        />
        <StatCard
          title="Active Agents"
          value={agentStats?.online ?? 0}
          subtitle={`of ${agentStats?.total ?? 0} total`}
          icon={MonitorCheck}
          color="green"
        />
        <StatCard
          title="Critical Alerts"
          value={alertStats?.critical ?? 0}
          subtitle="Unresolved"
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Blocked Uploads"
          value={stats?.blockedUploads ?? 0}
          subtitle={`${stats?.totalEvents ? ((stats.blockedUploads / stats.totalEvents) * 100).toFixed(1) : 0}% rate`}
          icon={ShieldOff}
          color="orange"
        />
        <StatCard
          title="High-Risk Users"
          value={stats?.highRiskUsers ?? 0}
          subtitle="BRS ≥ 60"
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Avg TRS"
          value={stats?.avgTrs ?? 0}
          subtitle="Transaction risk"
          icon={BarChart3}
          color="slate"
        />
      </div>

      {/* Alert Feed + Top Risk Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertFeed />
        <TopRiskUsers users={riskProfiles || []} />
      </div>

      {/* Charts Row 1: Channel + Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChannelPieChart data={channelData || []} />
        <RiskDistributionChart data={riskData || []} />
      </div>

      {/* Charts Row 2: Sensitivity + Blocked/Allowed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SensitivityBarChart data={sensitivityData || []} />
        <BlockedAllowedChart data={blockedAllowed || []} />
      </div>

      {/* Upload Volume Trend */}
      <UploadTrendChart
        data={trendData || []}
        period={trendPeriod}
        onPeriodChange={setTrendPeriod}
      />

      {/* Agent Status Grid */}
      <AgentStatusGrid agents={agents || []} />
    </div>
  );
}
