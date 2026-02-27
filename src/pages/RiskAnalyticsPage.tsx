import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "../services/analytics-service";
import { UploadTrendChart } from "../components/charts/UploadTrendChart";
import { ChannelPieChart } from "../components/charts/ChannelPieChart";
import { RiskDistributionChart } from "../components/charts/RiskDistributionChart";
import { SensitivityBarChart } from "../components/charts/SensitivityBarChart";
import { FileTypePieChart } from "../components/charts/FileTypePieChart";
import { TrsHistogram, BrsHistogram } from "../components/charts/Histograms";
import { TopDestinationsChart } from "../components/charts/TopDestinationsChart";
import { DeptRiskBarChart } from "../components/charts/DeptRiskBarChart";
import { TimeHeatmap } from "../components/charts/TimeHeatmap";
import { AlertSeverityChart } from "../components/charts/AlertSeverityChart";
import { EscalationTimeline } from "../components/charts/EscalationTimeline";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { BarChart3 } from "lucide-react";

export function RiskAnalyticsPage() {
  const [trendPeriod, setTrendPeriod] = useState<"7d" | "30d" | "90d">("30d");

  const { data: trendData, isLoading } = useQuery({
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

  const { data: fileTypeData } = useQuery({
    queryKey: ["fileTypeDistribution"],
    queryFn: () => analyticsService.getFileTypeDistribution(),
  });

  const { data: trsHistData } = useQuery({
    queryKey: ["trsHistogram"],
    queryFn: () => analyticsService.getTrsHistogramData(),
  });

  const { data: brsHistData } = useQuery({
    queryKey: ["brsHistogram"],
    queryFn: () => analyticsService.getBrsHistogramData(),
  });

  const { data: destData } = useQuery({
    queryKey: ["topDestinations"],
    queryFn: () => analyticsService.getTopDestinations(10),
  });

  const { data: deptData } = useQuery({
    queryKey: ["deptRisk"],
    queryFn: () => analyticsService.getDeptRiskComparison(),
  });

  const { data: alertSeverityData } = useQuery({
    queryKey: ["alertSeverity"],
    queryFn: () => analyticsService.getAlertSeverityBreakdown(),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-slate-700" />
        <h1 className="text-2xl font-semibold text-slate-900">Risk Analytics</h1>
      </div>

      {/* Upload Volume Trend - Full Width */}
      <UploadTrendChart
        data={trendData || []}
        period={trendPeriod}
        onPeriodChange={setTrendPeriod}
      />

      {/* Row 1: Channel + Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChannelPieChart data={channelData || []} />
        <RiskDistributionChart data={riskData || []} />
      </div>

      {/* Row 2: Sensitivity + File Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SensitivityBarChart data={sensitivityData || []} />
        <FileTypePieChart data={fileTypeData || []} />
      </div>

      {/* Row 3: TRS + BRS Histograms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrsHistogram data={trsHistData || []} />
        <BrsHistogram data={brsHistData || []} />
      </div>

      {/* Row 4: Top Destinations + Department Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopDestinationsChart data={destData || []} />
        <DeptRiskBarChart data={deptData || []} />
      </div>

      {/* Row 5: Alert Severity + Escalation Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertSeverityChart data={alertSeverityData || []} />
        <EscalationTimeline data={[]} />
      </div>

      {/* Time Heatmap - Full Width */}
      <TimeHeatmap data={[]} />
    </div>
  );
}
