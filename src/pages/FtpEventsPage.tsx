import { EmptyState } from "../components/common/LoadingSpinner";
import { FolderUp } from "lucide-react";

export function FtpEventsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FolderUp className="h-6 w-6 text-slate-700" />
        <h1 className="text-2xl font-semibold text-slate-900">FTP Events</h1>
      </div>
      <EmptyState
        title="FTP Monitoring Coming Soon"
        description="FTP event monitoring is planned for a future release. Events from the ftpEvents collection will appear here once endpoint agents begin reporting FTP activity."
      />
    </div>
  );
}
