import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { eventService } from "../services/event-service";
import { DataTable } from "../components/common/DataTable";
import { BooleanBadge } from "../components/common/Badges";
import { formatDate } from "../utils/formatters";
import { createColumnHelper } from "@tanstack/react-table";
import type { ClipboardEvent } from "../types/clipboard-event";
import { ClipboardList } from "lucide-react";

const columnHelper = createColumnHelper<ClipboardEvent>();

export function ClipboardEventsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["clipboardEvents"],
    queryFn: () => eventService.getClipboardEvents({}),
  });

  const columns = useMemo(() => [
    columnHelper.accessor("timestamp", {
      header: "Timestamp",
      cell: (info) => (
        <span className="text-xs text-slate-600">
          {formatDate(info.getValue() instanceof Date ? info.getValue() : new Date(info.getValue() as string))}
        </span>
      ),
    }),
    columnHelper.accessor("sourceProcess", {
      header: "Source Process",
      cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("contentLength", {
      header: "Content Length",
      cell: (info) => <span className="text-sm font-mono">{info.getValue()}</span>,
    }),
    columnHelper.accessor("containsSensitiveData", {
      header: "Sensitive Data",
      cell: (info) => <BooleanBadge value={info.getValue()} trueLabel="Yes" falseLabel="No" />,
    }),
    columnHelper.accessor("isTargetingAiApp", {
      header: "AI Target",
      cell: (info) => info.getValue() ? (
        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">AI App</span>
      ) : <span className="text-xs text-slate-400">No</span>,
    }),
    columnHelper.accessor("targetAiAppName", {
      header: "AI App",
      cell: (info) => <span className="text-sm">{info.getValue() || "—"}</span>,
    }),
    columnHelper.accessor("matchedPatterns", {
      header: "Patterns",
      cell: (info) => {
        const patterns = info.getValue() || [];
        return patterns.length > 0 ? (
          <div className="flex gap-1 flex-wrap">
            {patterns.slice(0, 3).map((p, i) => (
              <span key={i} className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">{p}</span>
            ))}
            {patterns.length > 3 && <span className="text-xs text-slate-400">+{patterns.length - 3}</span>}
          </div>
        ) : <span className="text-xs text-slate-400">—</span>;
      },
    }),
    columnHelper.accessor("riskScore", {
      header: "Risk Score",
      cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
    }),
  ], []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-6 w-6 text-slate-700" />
        <h1 className="text-2xl font-semibold text-slate-900">Clipboard Events</h1>
      </div>
      <DataTable columns={columns} data={data?.events || []} isLoading={isLoading} />
    </div>
  );
}
