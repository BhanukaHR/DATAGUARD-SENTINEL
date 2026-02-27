import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const SEVERITY_COLORS: Record<string, string> = {
  Info: "#3b82f6", Warning: "#eab308", Block: "#f97316", Critical: "#ef4444",
};

export function AlertSeverityChart({ data }: { data: { name: string; value: number; percentage: number }[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h3 className="text-sm font-medium text-slate-900 mb-4">Alert Severity</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={2}
            dataKey="value" isAnimationActive={false}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            label={({ percent }: any) => ((percent ?? 0) * 100 > 5 ? `${Math.round((percent ?? 0) * 100)}%` : "")}>
            {data.map((e) => (<Cell key={e.name} fill={SEVERITY_COLORS[e.name] || "#94a3b8"} />))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px" }} />
          <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8}
            wrapperStyle={{ fontSize: "12px", color: "#64748b" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
