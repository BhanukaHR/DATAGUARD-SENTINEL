import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { eventService } from "../services/event-service";
import { DataTable } from "../components/common/DataTable";
import { SensitivityBadge, BooleanBadge } from "../components/common/Badges";
import { formatDate, formatFileSize } from "../utils/formatters";
import { createColumnHelper } from "@tanstack/react-table";
import type { RemovableMediaEvent } from "../types/removable-media-event";
import { Usb } from "lucide-react";

const columnHelper = createColumnHelper<RemovableMediaEvent>();

export function UsbEventsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["usbEvents"],
    queryFn: () => eventService.getUsbEvents({}),
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
    columnHelper.accessor("driveLetter", {
      header: "Drive",
      cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("volumeLabel", {
      header: "Volume",
      cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("fileName", {
      header: "File",
      cell: (info) => <span className="text-sm truncate max-w-[200px] block">{info.getValue()}</span>,
    }),
    columnHelper.accessor("fileSizeBytes", {
      header: "Size",
      cell: (info) => <span className="text-xs text-slate-600">{formatFileSize(info.getValue())}</span>,
    }),
    columnHelper.accessor("sensitivityLevel", {
      header: "Sensitivity",
      cell: (info) => <SensitivityBadge level={info.getValue()} />,
    }),
    columnHelper.accessor("isBlocked", {
      header: "Blocked",
      cell: (info) => <BooleanBadge value={info.getValue()} trueLabel="Blocked" falseLabel="Allowed" />,
    }),
    columnHelper.accessor("blockReason", {
      header: "Reason",
      cell: (info) => <span className="text-xs text-slate-500">{info.getValue() || "—"}</span>,
    }),
    columnHelper.accessor("riskScore", {
      header: "Risk",
      cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
    }),
  ], []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Usb className="h-6 w-6 text-slate-700" />
        <h1 className="text-2xl font-semibold text-slate-900">USB Events</h1>
      </div>
      <DataTable columns={columns} data={data?.events || []} isLoading={isLoading} />
    </div>
  );
}
