import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { auditService } from "../services/audit-service";
import { DataTable } from "../components/common/DataTable";
import { formatDate } from "../utils/formatters";
import { createColumnHelper } from "@tanstack/react-table";
import type { AuditLog } from "../types/audit-log";
import { ScrollText } from "lucide-react";

const columnHelper = createColumnHelper<AuditLog>();

export function AuditLogPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["auditLogs"],
    queryFn: () => auditService.getAuditLogs({}),
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
    columnHelper.accessor("action", {
      header: "Action",
      cell: (info) => (
        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("channel", {
      header: "Channel",
      cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("target", {
      header: "Target",
      cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("details", {
      header: "Details",
      cell: (info) => <span className="text-xs text-slate-500 truncate max-w-[300px] block">{info.getValue()}</span>,
    }),
    columnHelper.accessor("riskScore", {
      header: "Risk Score",
      cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("userId", {
      header: "User",
      cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    }),
  ], []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ScrollText className="h-6 w-6 text-slate-700" />
          <h1 className="text-2xl font-semibold text-slate-900">Audit Log</h1>
        </div>
        <span className="text-xs text-slate-400">Read-only — Immutable audit trail</span>
      </div>
      <DataTable columns={columns} data={data || []} isLoading={isLoading} />
    </div>
  );
}
