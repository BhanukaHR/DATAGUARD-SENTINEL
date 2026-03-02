import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { eventService } from "../services/event-service";
import { useAlertStore } from "../store/alert-store";
import { DataTable } from "../components/common/DataTable";
import { BooleanBadge } from "../components/common/Badges";
import { formatDate } from "../utils/formatters";
import { createColumnHelper } from "@tanstack/react-table";
import type { AiApplicationEvent } from "../types/ai-application-event";
import { Bot } from "lucide-react";

const columnHelper = createColumnHelper<AiApplicationEvent>();

export function AiEventsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["aiEvents"],
    queryFn: () => eventService.getAiEvents({}),
  });

  const liveAiEvents = useAlertStore((s) => s.liveAiEvents);

  // Merge live SignalR events with Firestore events, deduplicate by eventId
  const mergedEvents = useMemo(() => {
    const firestoreEvents = data?.events || [];
    const all = [...liveAiEvents, ...firestoreEvents];
    const seen = new Set<string>();
    return all.filter((e) => {
      const id = e.eventId;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [liveAiEvents, data?.events]);

  const columns = useMemo(() => [
    columnHelper.accessor("timestamp", {
      header: "Timestamp",
      cell: (info) => (
        <span className="text-xs text-slate-600">
          {formatDate(info.getValue() instanceof Date ? info.getValue() : new Date(info.getValue() as string))}
        </span>
      ),
    }),
    columnHelper.accessor("userId", {
      header: "User",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{row.username || row.userId}</span>
            {row.username && <span className="text-xs text-slate-400">{row.userId}</span>}
          </div>
        );
      },
    }),
    columnHelper.accessor("eventType", {
      header: "Event Type",
      cell: (info) => (
        <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("applicationName", {
      header: "Application",
      cell: (info) => <span className="text-sm font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor("processName", {
      header: "Process",
      cell: (info) => <span className="text-xs text-slate-500">{info.getValue()}</span>,
    }),
    columnHelper.accessor("resolvedDomain", {
      header: "Domain",
      cell: (info) => <span className="text-xs text-slate-600">{info.getValue()}</span>,
    }),
    columnHelper.accessor("riskScore", {
      header: "Risk",
      cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("isBlocked", {
      header: "Blocked",
      cell: (info) => <BooleanBadge value={info.getValue()} trueLabel="Blocked" falseLabel="Allowed" />,
    }),
    columnHelper.accessor("contentPreview", {
      header: "Content Preview",
      cell: (info) => {
        const content = info.getValue();
        return content ? (
          <span className="text-xs text-slate-500 truncate max-w-[200px] block" title={content}>{content}</span>
        ) : <span className="text-xs text-slate-400">—</span>;
      },
    }),
  ], []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bot className="h-6 w-6 text-slate-700" />
        <h1 className="text-2xl font-semibold text-slate-900">AI Application Events</h1>
      </div>
      <DataTable columns={columns} data={mergedEvents} isLoading={isLoading} />
    </div>
  );
}
