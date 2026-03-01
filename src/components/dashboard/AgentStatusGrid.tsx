import type { AgentHeartbeat } from "../../types/agent";
import { agentService } from "../../services/agent-service";
import { formatTimeAgo, toDate } from "../../utils/formatters";

interface AgentStatusGridProps {
  agents: AgentHeartbeat[];
}

export function AgentStatusGrid({ agents }: AgentStatusGridProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg">
      <div className="px-5 py-3 border-b border-slate-100">
        <h3 className="text-sm font-medium text-slate-900">Agent Status</h3>
      </div>
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {agents.length === 0 ? (
          <p className="col-span-full text-center text-xs text-slate-400 py-4">No agents registered</p>
        ) : (
          agents.map((agent) => {
            const status = agentService.getAgentStatus(agent.lastHeartbeat);
            const statusColor = status === "online" ? "bg-green-500" : status === "warning" ? "bg-yellow-500" : "bg-red-500";
            return (
              <div
                key={agent.agentId}
                className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-md border border-slate-100"
              >
                <span className={`h-2.5 w-2.5 rounded-full ${statusColor} shrink-0`} />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate">{agent.machineName}</p>
                  <p className="text-[10px] text-slate-500">
                    {agent.lastHeartbeat ? formatTimeAgo(toDate(agent.lastHeartbeat)) : "—"}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
