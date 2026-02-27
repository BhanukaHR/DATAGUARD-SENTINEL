import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { alertService } from "../services/alert-service";
import { DataTable } from "../components/common/DataTable";
import { AlertTypeBadge, ChannelBadge, BooleanBadge } from "../components/common/Badges";
import { formatTimeAgo } from "../utils/formatters";
import { useAlertStore } from "../store/alert-store";
import { createColumnHelper } from "@tanstack/react-table";
import type { DlpAlert } from "../types/dlp-alert";
import { toast } from "sonner";
import { Bell } from "lucide-react";

const columnHelper = createColumnHelper<DlpAlert>();

export function AlertsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { liveAlerts } = useAlertStore();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [resolvedFilter, setResolvedFilter] = useState<string>("all");

  const { data: alertsData, isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => alertService.getAlerts({}),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, resolvedBy }: { id: string; resolvedBy: string }) =>
      alertService.resolveAlert(id, resolvedBy),
    onSuccess: () => {
      toast.success("Alert resolved");
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });

  const columns = useMemo(() => [
    columnHelper.accessor("type", {
      header: "Severity",
      cell: (info) => <AlertTypeBadge type={info.getValue()} />,
    }),
    columnHelper.accessor("title", {
      header: "Title",
      cell: (info) => (
        <button
          className="text-left text-blue-600 hover:underline text-sm font-medium"
          onClick={() => navigate(`/alerts/${info.row.original.alertId}`)}
        >
          {info.getValue()}
        </button>
      ),
    }),
    columnHelper.accessor("channel", {
      header: "Channel",
      cell: (info) => <ChannelBadge channel={info.getValue()} />,
    }),
    columnHelper.accessor("riskScore", {
      header: "Risk Score",
      cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("isEscalation", {
      header: "Escalation",
      cell: (info) => info.getValue() ? (
        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Escalation</span>
      ) : null,
    }),
    columnHelper.accessor("isResolved", {
      header: "Status",
      cell: (info) => <BooleanBadge value={info.getValue()} trueLabel="Resolved" falseLabel="Open" />,
    }),
    columnHelper.accessor("timestamp", {
      header: "Time",
      cell: (info) => (
        <span className="text-xs text-slate-500">
          {formatTimeAgo(info.getValue() instanceof Date ? info.getValue() : new Date(info.getValue() as string))}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => (
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/alerts/${info.row.original.alertId}`)}
            className="text-xs px-2 py-1 bg-slate-100 rounded hover:bg-slate-200 transition-colors"
          >
            View
          </button>
          {!info.row.original.isResolved && (
            <button
              onClick={() => resolveMutation.mutate({ id: info.row.original.alertId, resolvedBy: "admin" })}
              className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
            >
              Resolve
            </button>
          )}
        </div>
      ),
    }),
  ], [navigate, resolveMutation]);

  const allAlerts = useMemo(() => {
    const firestoreAlerts = alertsData?.alerts || [];
    const combined = [...liveAlerts, ...firestoreAlerts];
    // Deduplicate by alertId
    const seen = new Set<string>();
    return combined.filter((a) => {
      if (seen.has(a.alertId)) return false;
      seen.add(a.alertId);
      return true;
    });
  }, [alertsData, liveAlerts]);

  const filteredAlerts = useMemo(() => {
    return allAlerts.filter((a) => {
      if (typeFilter !== "all" && a.type !== typeFilter) return false;
      if (resolvedFilter === "resolved" && !a.isResolved) return false;
      if (resolvedFilter === "open" && a.isResolved) return false;
      return true;
    });
  }, [allAlerts, typeFilter, resolvedFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-slate-700" />
          <h1 className="text-2xl font-semibold text-slate-900">Alerts</h1>
        </div>
        <span className="text-xs text-slate-500">{filteredAlerts.length} alerts</span>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-md bg-white"
        >
          <option value="all">All Types</option>
          <option value="Info">Info</option>
          <option value="Warning">Warning</option>
          <option value="Block">Block</option>
          <option value="Critical">Critical</option>
        </select>
        <select
          value={resolvedFilter}
          onChange={(e) => setResolvedFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-md bg-white"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <DataTable columns={columns} data={filteredAlerts} isLoading={isLoading} />
    </div>
  );
}
