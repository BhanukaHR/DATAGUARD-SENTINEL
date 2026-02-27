import { RiskLevelBadge } from "../common/Badges";
import { useNavigate } from "react-router-dom";
import type { UserRiskProfile } from "../../types/user-risk-profile";

interface TopRiskUsersProps {
  users: UserRiskProfile[];
}

export function TopRiskUsers({ users }: TopRiskUsersProps) {
  const navigate = useNavigate();
  const sorted = [...users].sort((a, b) => b.behavioralRiskScore - a.behavioralRiskScore).slice(0, 5);

  return (
    <div className="bg-white border border-slate-200 rounded-lg">
      <div className="px-5 py-3 border-b border-slate-100">
        <h3 className="text-sm font-medium text-slate-900">Top Risk Users</h3>
      </div>
      <div className="divide-y divide-slate-50">
        {sorted.length === 0 ? (
          <p className="px-5 py-8 text-center text-xs text-slate-400">No risk profiles available</p>
        ) : (
          sorted.map((user, i) => (
            <button
              key={user.userId}
              onClick={() => navigate(`/users/${user.userId}`)}
              className="w-full text-left px-5 py-3 hover:bg-slate-50 transition-colors flex items-center gap-3"
            >
              <span className="text-xs font-medium text-slate-400 w-4">{i + 1}.</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-800 truncate">{user.username}</p>
                <p className="text-[11px] text-slate-500">{user.department}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">{user.behavioralRiskScore}</span>
                <RiskLevelBadge level={user.currentRiskLevel} />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
