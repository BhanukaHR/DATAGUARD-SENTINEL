import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/user-service";
import { eventService } from "../services/event-service";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { RiskLevelBadge, StatusBadge, SensitivityBadge } from "../components/common/Badges";
import { BrsTrendChart } from "../components/charts/BrsTrendChart";
import { ChannelPieChart } from "../components/charts/ChannelPieChart";
import { formatDate, formatNumber } from "../utils/formatters";
import { RISK_COLORS } from "../utils/risk-colors";
import { toast } from "sonner";
import { ArrowLeft, AlertTriangle, Upload, ShieldOff, Clock } from "lucide-react";

export function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => userService.getUserById(userId!),
    enabled: !!userId,
  });

  const { data: riskProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["userRiskProfile", userId],
    queryFn: () => userService.getUserRiskProfile(userId!),
    enabled: !!userId,
  });

  const { data: uploadData } = useQuery({
    queryKey: ["userUploads", userId],
    queryFn: () => eventService.getUploadEvents({ userId }),
    enabled: !!userId,
  });

  const removeMutation = useMutation({
    mutationFn: () => userService.removeUser(userId!),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("User removed successfully");
        navigate("/users");
      } else {
        toast.error("Failed: " + result.error);
      }
    },
  });

  if (userLoading || profileLoading) return <LoadingSpinner />;
  if (!user) return <p className="text-sm text-slate-500 p-6">User not found.</p>;

  const brs = riskProfile?.behavioralRiskScore ?? 0;
  const riskLevel = riskProfile?.currentRiskLevel ?? "Low";
  const riskColor = brs >= 85 ? RISK_COLORS.CRITICAL : brs >= 60 ? RISK_COLORS.HIGH : brs >= 30 ? RISK_COLORS.MEDIUM : RISK_COLORS.LOW;

  // BRS trend from violation history
  const brsTrendData = (riskProfile?.violationHistory || [])
    .sort((a, b) => new Date(a.timestamp as string).getTime() - new Date(b.timestamp as string).getTime())
    .reduce((acc: { date: string; brs: number }[], v, i) => {
      const prevBrs = i > 0 ? acc[i - 1].brs : 0;
      acc.push({
        date: v.timestamp instanceof Date ? v.timestamp.toISOString() : String(v.timestamp),
        brs: Math.min(100, prevBrs + v.riskScoreImpact),
      });
      return acc;
    }, []);

  // Channel breakdown for user uploads
  const channelCounts: Record<string, number> = {};
  (uploadData?.events || []).forEach((e) => {
    channelCounts[e.channel] = (channelCounts[e.channel] || 0) + 1;
  });
  const total = uploadData?.events?.length || 0;
  const channelChartData = Object.entries(channelCounts).map(([name, value]) => ({
    name,
    value,
    percentage: total > 0 ? Math.round((value / total) * 100) : 0,
  }));

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("/users")} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Back to Users
      </button>

      {/* User Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{user.username}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
              <span>ID: {user.employeeId}</span>
              <span>Machine: {user.machineName}</span>
              {user.department && <span>Dept: {user.department}</span>}
              <StatusBadge status={user.status} />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Registered: {formatDate(user.registeredAt instanceof Date ? user.registeredAt : new Date(user.registeredAt as string))}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => removeMutation.mutate()}
              className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
            >
              Remove User
            </button>
          </div>
        </div>
      </div>

      {/* Risk Score Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BRS Gauge */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col items-center">
          <h3 className="text-sm font-medium text-slate-900 mb-4">Behavioral Risk Score</h3>
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" stroke="#e2e8f0" strokeWidth="10" fill="none" />
              <circle
                cx="60" cy="60" r="50"
                stroke={riskColor}
                strokeWidth="10"
                fill="none"
                strokeDasharray={`${(brs / 100) * 314} 314`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold" style={{ color: riskColor }}>{brs}</span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
          </div>
          <div className="mt-3">
            <RiskLevelBadge level={riskLevel} />
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-slate-900 mb-4">Activity Statistics</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Upload className="h-4 w-4" /> Total Uploads
              </div>
              <span className="font-semibold">{formatNumber(riskProfile?.totalUploads ?? 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <ShieldOff className="h-4 w-4" /> Blocked
              </div>
              <span className="font-semibold text-red-600">{formatNumber(riskProfile?.blockedUploads ?? 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <AlertTriangle className="h-4 w-4" /> High Risk
              </div>
              <span className="font-semibold text-orange-600">{formatNumber(riskProfile?.highRiskUploads ?? 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="h-4 w-4" /> Last Upload
              </div>
              <span className="text-xs text-slate-500">
                {riskProfile?.lastUploadTime
                  ? formatDate(riskProfile.lastUploadTime instanceof Date ? riskProfile.lastUploadTime : new Date(riskProfile.lastUploadTime as string))
                  : "Never"}
              </span>
            </div>
          </div>
        </div>

        {/* Channel Breakdown */}
        <ChannelPieChart data={channelChartData} height={220} />
      </div>

      {/* BRS Trend Chart */}
      {brsTrendData.length > 0 && <BrsTrendChart data={brsTrendData} />}

      {/* Violation Timeline */}
      {riskProfile?.violationHistory && riskProfile.violationHistory.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-slate-900 mb-4">Violation History</h3>
          <div className="space-y-3">
            {riskProfile.violationHistory
              .sort((a, b) => new Date(b.timestamp as string).getTime() - new Date(a.timestamp as string).getTime())
              .map((v, i) => (
                <div key={i} className="flex items-start gap-3 border-l-2 border-slate-200 pl-4 py-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded">{v.type}</span>
                      <span className="text-xs text-slate-400">
                        {formatDate(v.timestamp instanceof Date ? v.timestamp : new Date(v.timestamp as string))}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 mt-1">{v.description}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Risk impact: +{v.riskScoreImpact}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent Upload Events */}
      {(uploadData?.events || []).length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-slate-900 mb-4">Recent Upload Events</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 uppercase border-b">
                  <th className="py-2 text-left">Time</th>
                  <th className="py-2 text-left">File</th>
                  <th className="py-2 text-left">Channel</th>
                  <th className="py-2 text-left">Destination</th>
                  <th className="py-2 text-left">Sensitivity</th>
                  <th className="py-2 text-left">TRS</th>
                  <th className="py-2 text-left">Blocked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(uploadData?.events || []).slice(0, 50).map((e, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-2 text-xs text-slate-500">
                      {formatDate(e.timestamp instanceof Date ? e.timestamp : new Date(e.timestamp as string))}
                    </td>
                    <td className="py-2 truncate max-w-[150px]">{e.fileName}</td>
                    <td className="py-2">{e.channel}</td>
                    <td className="py-2 text-xs">{e.destinationDomain}</td>
                    <td className="py-2"><SensitivityBadge level={e.sensitivityLevel} /></td>
                    <td className="py-2 font-mono">{e.transactionRiskScore}</td>
                    <td className="py-2">{e.isBlocked ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
