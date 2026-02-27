import { useAlertStore } from "../../store/alert-store";
import { AlertTypeBadge } from "../common/Badges";
import { useNavigate } from "react-router-dom";
import { formatTimeAgo } from "../../utils/formatters";

export function AlertFeed() {
  const { liveAlerts } = useAlertStore();
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-slate-200 rounded-lg">
      <div className="px-5 py-3 border-b border-slate-100">
        <h3 className="text-sm font-medium text-slate-900">Live Alert Feed</h3>
      </div>
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
        {liveAlerts.length === 0 ? (
          <p className="px-5 py-8 text-center text-xs text-slate-400">No live alerts — waiting for real-time data</p>
        ) : (
          liveAlerts.slice(0, 20).map((alert, i) => (
            <button
              key={i}
              onClick={() => navigate(`/alerts/${alert.alertId}`)}
              className="w-full text-left px-5 py-3 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <AlertTypeBadge type={alert.type} />
                <span className="text-[11px] text-slate-400">
                  {alert.timestamp ? formatTimeAgo(new Date(alert.timestamp as string)) : "just now"}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-800 truncate">{alert.title}</p>
              <p className="text-[11px] text-slate-500 truncate">{alert.message}</p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
