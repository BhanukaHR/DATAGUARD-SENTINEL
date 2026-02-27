import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { agentService } from "../services/agent-service";
import { DataTable } from "../components/common/DataTable";
import { formatTimeAgo } from "../utils/formatters";
import { createColumnHelper } from "@tanstack/react-table";
import type { AgentHeartbeat } from "../types/agent";
import { AgentStatusGrid } from "../components/dashboard/AgentStatusGrid";
import { AgentStatusDonut } from "../components/charts/AgentStatusDonut";
import { MonitorCheck } from "lucide-react";

const columnHelper = createColumnHelper<AgentHeartbeat>();

export function AgentsPage() {
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: () => agentService.getAllAgents(),
    refetchInterval: 30000,
  });

  const { data: stats } = useQuery({
    queryKey: ["agentStats"],
    queryFn: () => agentService.getAgentStats(),
    refetchInterval: 30000,
  });

  const statusDonutData = useMemo(() => [
    { name: "Online", value: stats?.online ?? 0, color: "#22c55e" },
    { name: "Warning", value: stats?.warning ?? 0, color: "#eab308" },
    { name: "Offline", value: stats?.offline ?? 0, color: "#ef4444" },
  ], [stats]);

  const columns = useMemo(() => [
    columnHelper.accessor("machineName", {
      header: "Machine Name",
      cell: (info) => <span className="text-sm font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor("agentId", {
      header: "Agent ID",
      cell: (info) => <span className="font-mono text-xs text-slate-500">{info.getValue()}</span>,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const status = info.getValue();
        const colors = {
          online: "bg-green-100 text-green-700",
          warning: "bg-yellow-100 text-yellow-700",
          offline: "bg-red-100 text-red-700",
        };
        return (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    }),
    columnHelper.accessor("currentUserId", {
      header: "Current User",
      cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("lastHeartbeat", {
      header: "Last Heartbeat",
      cell: (info) => (
        <span className="text-xs text-slate-500">
          {formatTimeAgo(info.getValue() instanceof Date ? info.getValue() : new Date(info.getValue() as string))}
        </span>
      ),
    }),
    columnHelper.accessor("scanCount", {
      header: "Scan Count",
      cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("agentVersion", {
      header: "Version",
      cell: (info) => <span className="text-xs text-slate-500">{info.getValue() || "—"}</span>,
    }),
  ], []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MonitorCheck className="h-6 w-6 text-slate-700" />
          <h1 className="text-2xl font-semibold text-slate-900">Agents</h1>
        </div>
        <span className="text-xs text-slate-500">Auto-refreshes every 30s</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AgentStatusGrid agents={agents} />
        </div>
        <AgentStatusDonut data={statusDonutData} />
      </div>

      <DataTable columns={columns} data={agents} isLoading={isLoading} />
    </div>
  );
}
