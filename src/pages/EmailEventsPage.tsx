import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { eventService } from "../services/event-service";
import { useAlertStore } from "../store/alert-store";
import { DataTable } from "../components/common/DataTable";
import { BooleanBadge, SensitivityBadge } from "../components/common/Badges";
import { formatDate } from "../utils/formatters";
import { createColumnHelper } from "@tanstack/react-table";
import type { EmailExfiltrationEvent } from "../types/email-event";
import { Mail } from "lucide-react";

const columnHelper = createColumnHelper<EmailExfiltrationEvent>();

export function EmailEventsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["emailEvents"],
    queryFn: () => eventService.getEmailEvents({}),
  });

  const liveEmailEvents = useAlertStore((s) => s.liveEmailEvents);

  // Merge live SignalR events with Firestore events, deduplicate by eventId
  const mergedEvents = useMemo(() => {
    const firestoreEvents = data?.events || [];
    const all = [...liveEmailEvents, ...firestoreEvents];
    const seen = new Set<string>();
    return all.filter((e) => {
      const id = e.eventId;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [liveEmailEvents, data?.events]);

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
      cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("eventType", {
      header: "Event Type",
      cell: (info) => {
        const type = info.getValue();
        const colorMap: Record<string, string> = {
          ProcessDetected: "bg-blue-50 text-blue-700",
          NetworkConnection: "bg-orange-50 text-orange-700",
          AttachmentDetected: "bg-red-50 text-red-700",
          ComposeDetected: "bg-purple-50 text-purple-700",
        };
        return (
          <span className={`text-xs px-2 py-0.5 rounded-full ${colorMap[type] || "bg-slate-50 text-slate-700"}`}>
            {type}
          </span>
        );
      },
    }),
    columnHelper.accessor("applicationName", {
      header: "Application",
      cell: (info) => <span className="text-sm font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor("processName", {
      header: "Process",
      cell: (info) => <span className="text-xs text-slate-500">{info.getValue()}</span>,
    }),
    columnHelper.accessor("recipient", {
      header: "Recipient",
      cell: (info) => {
        const val = info.getValue();
        return val ? (
          <span className="text-xs text-slate-700">{val}</span>
        ) : <span className="text-xs text-slate-400">—</span>;
      },
    }),
    columnHelper.accessor("subject", {
      header: "Subject",
      cell: (info) => {
        const val = info.getValue();
        return val ? (
          <span className="text-xs text-slate-700 truncate max-w-[180px] block" title={val}>{val}</span>
        ) : <span className="text-xs text-slate-400">—</span>;
      },
    }),
    columnHelper.accessor("attachmentName", {
      header: "Attachment",
      cell: (info) => {
        const name = info.getValue();
        return name ? (
          <span className="text-xs text-slate-700 truncate max-w-[150px] block" title={name}>{name}</span>
        ) : <span className="text-xs text-slate-400">—</span>;
      },
    }),
    columnHelper.accessor("remoteAddress", {
      header: "Mail Server",
      cell: (info) => {
        const row = info.row.original;
        return (
          <span className="text-xs font-mono text-slate-600">
            {info.getValue()}:{row.remotePort}
          </span>
        );
      },
    }),
    columnHelper.accessor("sensitivityLevel", {
      header: "Sensitivity",
      cell: (info) => <SensitivityBadge level={info.getValue()} />,
    }),
    columnHelper.accessor("riskScore", {
      header: "Risk",
      cell: (info) => {
        const score = info.getValue();
        const color = score >= 75 ? "text-red-600" : score >= 50 ? "text-orange-600" : "text-slate-600";
        return <span className={`font-mono text-sm font-semibold ${color}`}>{score}</span>;
      },
    }),
    columnHelper.accessor("isBlocked", {
      header: "Blocked",
      cell: (info) => <BooleanBadge value={info.getValue()} trueLabel="Blocked" falseLabel="Allowed" />,
    }),
  ], []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Mail className="h-6 w-6 text-slate-700" />
        <h1 className="text-2xl font-semibold text-slate-900">Email Events</h1>
        {liveEmailEvents.length > 0 && (
          <span className="text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
            {liveEmailEvents.length} live
          </span>
        )}
      </div>
      <DataTable columns={columns} data={mergedEvents} isLoading={isLoading} />
    </div>
  );
}
