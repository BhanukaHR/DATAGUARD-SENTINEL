import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { eventService } from "../services/event-service";
import { DataTable } from "../components/common/DataTable";
import { SensitivityBadge, ChannelBadge, BooleanBadge } from "../components/common/Badges";
import { formatDate } from "../utils/formatters";
import { createColumnHelper } from "@tanstack/react-table";
import type { UploadEvent } from "../types/upload-event";
import { Upload } from "lucide-react";

const columnHelper = createColumnHelper<UploadEvent>();

export function UploadEventsPage() {
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [sensitivityFilter, setSensitivityFilter] = useState<string>("all");
  const [blockedFilter, setBlockedFilter] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["uploadEvents"],
    queryFn: () => eventService.getUploadEvents({}),
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
    columnHelper.accessor("userId", {
      header: "User",
      cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("fileName", {
      header: "File Name",
      cell: (info) => <span className="text-sm truncate max-w-[200px] block">{info.getValue()}</span>,
    }),
    columnHelper.accessor("channel", {
      header: "Channel",
      cell: (info) => <ChannelBadge channel={info.getValue()} />,
    }),
    columnHelper.accessor("destinationDomain", {
      header: "Destination",
      cell: (info) => <span className="text-xs text-slate-600">{info.getValue()}</span>,
    }),
    columnHelper.accessor("sensitivityLevel", {
      header: "Sensitivity",
      cell: (info) => <SensitivityBadge level={info.getValue()} />,
    }),
    columnHelper.accessor("transactionRiskScore", {
      header: "TRS",
      cell: (info) => {
        const score = info.getValue();
        const color = score >= 80 ? "text-red-600" : score >= 60 ? "text-orange-600" : score >= 30 ? "text-yellow-600" : "text-green-600";
        return <span className={`font-mono font-medium ${color}`}>{score}</span>;
      },
    }),
    columnHelper.accessor("isBlocked", {
      header: "Blocked",
      cell: (info) => <BooleanBadge value={info.getValue()} trueLabel="Blocked" falseLabel="Allowed" />,
    }),
  ], []);

  const filteredEvents = useMemo(() => {
    const events = data?.events || [];
    return events.filter((e) => {
      if (channelFilter !== "all" && e.channel !== channelFilter) return false;
      if (sensitivityFilter !== "all" && e.sensitivityLevel !== sensitivityFilter) return false;
      if (blockedFilter === "blocked" && !e.isBlocked) return false;
      if (blockedFilter === "allowed" && e.isBlocked) return false;
      return true;
    });
  }, [data, channelFilter, sensitivityFilter, blockedFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Upload className="h-6 w-6 text-slate-700" />
        <h1 className="text-2xl font-semibold text-slate-900">Upload Events</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-md bg-white">
          <option value="all">All Channels</option>
          <option value="Browser">Browser</option>
          <option value="CloudSync">Cloud Sync</option>
          <option value="FTP">FTP</option>
          <option value="Email">Email</option>
          <option value="EnterpriseApp">Enterprise App</option>
        </select>
        <select value={sensitivityFilter} onChange={(e) => setSensitivityFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-md bg-white">
          <option value="all">All Sensitivity</option>
          <option value="Public">Public</option>
          <option value="Internal">Internal</option>
          <option value="Confidential">Confidential</option>
          <option value="Restricted">Restricted</option>
        </select>
        <select value={blockedFilter} onChange={(e) => setBlockedFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-md bg-white">
          <option value="all">All</option>
          <option value="blocked">Blocked</option>
          <option value="allowed">Allowed</option>
        </select>
      </div>

      <DataTable columns={columns} data={filteredEvents} isLoading={isLoading} />
    </div>
  );
}
