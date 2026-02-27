import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alertService } from "../services/alert-service";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { AlertTypeBadge, ChannelBadge } from "../components/common/Badges";
import { formatDate } from "../utils/formatters";
import { toast } from "sonner";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

export function AlertDetailPage() {
  const { alertId } = useParams<{ alertId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState("");

  const { data: alert, isLoading } = useQuery({
    queryKey: ["alert", alertId],
    queryFn: () => alertService.getAlertById(alertId!),
    enabled: !!alertId,
  });

  const resolveMutation = useMutation({
    mutationFn: () => alertService.resolveAlert(alertId!, "admin"),
    onSuccess: () => {
      toast.success("Alert resolved");
      queryClient.invalidateQueries({ queryKey: ["alert", alertId] });
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });

  const notesMutation = useMutation({
    mutationFn: (text: string) => alertService.addInvestigationNotes(alertId!, text),
    onSuccess: () => {
      toast.success("Notes updated");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["alert", alertId] });
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (!alert) return <p className="text-sm text-slate-500 p-6">Alert not found.</p>;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("/alerts")} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Alerts
      </button>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTypeBadge type={alert.type} />
          <h1 className="text-xl font-semibold text-slate-900">{alert.title}</h1>
          {alert.isEscalation && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Escalation</span>
          )}
        </div>
        {!alert.isResolved && (
          <button
            onClick={() => resolveMutation.mutate()}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Resolve Alert
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert Details */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <h3 className="text-sm font-medium text-slate-900">Alert Details</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Alert ID</dt>
              <dd className="font-mono text-slate-900">{alert.alertId}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Type</dt>
              <dd><AlertTypeBadge type={alert.type} /></dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Channel</dt>
              <dd><ChannelBadge channel={alert.channel} /></dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Risk Score</dt>
              <dd className="font-mono font-medium">{alert.riskScore}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Sensitivity</dt>
              <dd>{alert.sensitivityLevel}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">File</dt>
              <dd className="truncate max-w-[200px]">{alert.fileName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Timestamp</dt>
              <dd>{formatDate(alert.timestamp instanceof Date ? alert.timestamp : new Date(alert.timestamp as string))}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Status</dt>
              <dd>
                {alert.isResolved ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Resolved</span>
                ) : (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Open</span>
                )}
              </dd>
            </div>
            {alert.resolvedBy && (
              <div className="flex justify-between">
                <dt className="text-slate-500">Resolved By</dt>
                <dd>{alert.resolvedBy}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Message & Details */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-slate-900 mb-2">Message</h3>
            <p className="text-sm text-slate-700">{alert.message}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-slate-900 mb-2">Details</h3>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{alert.details}</p>
          </div>

          {/* Investigation Notes */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-slate-900 mb-2">Investigation Notes</h3>
            {alert.investigationNotes && (
              <p className="text-sm text-slate-700 mb-4 whitespace-pre-wrap bg-slate-50 p-3 rounded">
                {alert.investigationNotes}
              </p>
            )}
            <div className="flex gap-2">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add investigation notes..."
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-md resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => notes && notesMutation.mutate(notes)}
                disabled={!notes || notesMutation.isPending}
                className="px-4 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50 self-end"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
