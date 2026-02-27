import { EmptyState } from "../components/common/LoadingSpinner";
import { Mail } from "lucide-react";

export function EmailEventsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Mail className="h-6 w-6 text-slate-700" />
        <h1 className="text-2xl font-semibold text-slate-900">Email Events</h1>
      </div>
      <EmptyState
        title="Email Monitoring Coming Soon"
        description="Email event monitoring is planned for a future release. Events from the emailEvents collection will appear here once endpoint agents begin reporting email activity."
      />
    </div>
  );
}
