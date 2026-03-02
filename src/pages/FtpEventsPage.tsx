import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { eventService } from "../services/event-service";
import { useAlertStore } from "../store/alert-store";
import { DataTable } from "../components/common/DataTable";
import { BooleanBadge, SensitivityBadge } from "../components/common/Badges";
import { formatDate } from "../utils/formatters";
import { createColumnHelper } from "@tanstack/react-table";
import type { FtpTransferEvent } from "../types/ftp-event";
import { FolderUp } from "lucide-react";

const columnHelper = createColumnHelper<FtpTransferEvent>();

export function FtpEventsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["ftpEvents"],
    queryFn: () => eventService.getFtpEvents({}),
  });

  const liveFtpEvents = useAlertStore((s) => s.liveFtpEvents);

  // Merge live SignalR events with Firestore events, deduplicate by eventId
  const mergedEvents = useMemo(() => {
    const firestoreEvents = data?.events || [];
    const all = [...liveFtpEvents, ...firestoreEvents];
    const seen = new Set<string>();
    return all.filter((e) => {
      const id = e.eventId;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [liveFtpEvents, data?.events]);

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
          FileTransfer: "bg-red-50 text-red-700",
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
    columnHelper.accessor("remoteAddress", {
      header: "Remote Server",
      cell: (info) => {
        const row = info.row.original;
        return (
          <span className="text-xs font-mono text-slate-600">
            {info.getValue()}:{row.remotePort}
          </span>
        );
      },
    }),
    columnHelper.accessor("fileName", {
      header: "File",
      cell: (info) => {
        const name = info.getValue();
        return name ? (
          <span className="text-xs text-slate-700 truncate max-w-[180px] block" title={name}>{name}</span>
        ) : <span className="text-xs text-slate-400">—</span>;
      },
    }),
    columnHelper.accessor("fileSizeBytes", {
      header: "Size",
      cell: (info) => {
        const bytes = info.getValue();
        if (!bytes) return <span className="text-xs text-slate-400">—</span>;
        const kb = bytes / 1024;
        return (
          <span className="text-xs font-mono text-slate-600">
            {kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(1)} KB`}
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
        <FolderUp className="h-6 w-6 text-slate-700" />
        <h1 className="text-2xl font-semibold text-slate-900">FTP Events</h1>
        {liveFtpEvents.length > 0 && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
            {liveFtpEvents.length} live
          </span>
        )}
      </div>
      <DataTable columns={columns} data={mergedEvents} isLoading={isLoading} />
    </div>
  );
}
