import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { format } from "date-fns";

interface EscalationPoint {
  timestamp: string;
  alertId: string;
  userId: string;
  severity: number; // 1-4
}

const SEVERITY_COLORS = ["#3b82f6", "#f59e0b", "#f97316", "#ef4444"];

export function EscalationTimeline({ data }: { data: EscalationPoint[] }) {
  const formatted = data.map((d) => ({
    ...d,
    time: new Date(d.timestamp).getTime(),
  }));

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h3 className="text-sm font-medium text-slate-900 mb-4">Escalation Timeline</h3>
      {formatted.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-10">No escalations in selected period</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="time"
              type="number"
              domain={["dataMin", "dataMax"]}
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickFormatter={(v) => format(new Date(v), "MMM d")}
              name="Date"
            />
            <YAxis
              dataKey="severity"
              type="number"
              domain={[0, 5]}
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickFormatter={(v) => ["", "Low", "Med", "High", "Crit"][v] || ""}
              name="Severity"
            />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((value: any, name: any) => {
                const v = value ?? 0;
                if (name === "Date") return format(new Date(v), "MMM d, yyyy HH:mm");
                if (name === "Severity") return ["", "Low", "Medium", "High", "Critical"][v] || v;
                return v;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              }) as any}
            />
            <Scatter data={formatted} isAnimationActive={false}>
              {formatted.map((entry, idx) => (
                <Cell key={idx} fill={SEVERITY_COLORS[entry.severity - 1] || "#94a3b8"} r={6} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
