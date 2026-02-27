import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

const riskColor = (avgBrs: number) => {
  if (avgBrs < 30) return "#22c55e";
  if (avgBrs < 60) return "#eab308";
  if (avgBrs < 85) return "#f97316";
  return "#ef4444";
};

export function DeptRiskBarChart({ data }: { data: { dept: string; avgBrs: number }[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h3 className="text-sm font-medium text-slate-900 mb-4">Department Risk Comparison</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barSize={40}>
          <XAxis dataKey="dept" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px" }} />
          <Bar dataKey="avgBrs" name="Avg BRS" radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {data.map((entry, i) => (<Cell key={i} fill={riskColor(entry.avgBrs)} />))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
