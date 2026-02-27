import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

const SENS_COLORS: Record<string, string> = {
  Public: "#22c55e", Internal: "#3b82f6", Confidential: "#f97316", Restricted: "#ef4444",
};

export function SensitivityBarChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h3 className="text-sm font-medium text-slate-900 mb-4">Sensitivity Classification</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" barSize={24}>
          <XAxis type="number" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} width={100} />
          <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px" }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {data.map((entry) => (<Cell key={entry.name} fill={SENS_COLORS[entry.name] || "#94a3b8"} />))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
