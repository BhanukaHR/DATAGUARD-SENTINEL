import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export function BlockedAllowedChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const blocked = data.find((d) => d.name === "Blocked")?.value || 0;
  const blockRate = total > 0 ? Math.round((blocked / total) * 100) : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h3 className="text-sm font-medium text-slate-900 mb-4">Blocked vs Allowed</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
            dataKey="value" isAnimationActive={false}>
            {data.map((e) => (<Cell key={e.name} fill={e.color} />))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px" }} />
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="text-lg font-semibold fill-slate-900">
            {blockRate}%
          </text>
          <text x="50%" y="58%" textAnchor="middle" dominantBaseline="central" className="text-[10px] fill-slate-500">
            blocked
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
