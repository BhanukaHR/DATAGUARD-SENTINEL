import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS: Record<string, string> = {
  Document: "#3b82f6", Spreadsheet: "#22c55e", Archive: "#f97316",
  Code: "#6366f1", Database: "#ef4444", Image: "#ec4899",
  Video: "#8b5cf6", Other: "#94a3b8",
};

export function FileTypePieChart({ data }: { data: { name: string; value: number; percentage: number }[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h3 className="text-sm font-medium text-slate-900 mb-4">File Type Distribution</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2}
            dataKey="value" isAnimationActive={false}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            label={({ percent }: any) => ((percent ?? 0) * 100 > 5 ? `${Math.round((percent ?? 0) * 100)}%` : "")}>
            {data.map((e) => (<Cell key={e.name} fill={COLORS[e.name] || "#94a3b8"} />))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px" }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={((value: any, name: any) => [`${value ?? 0} files`, name]) as any} />
          <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8}
            wrapperStyle={{ fontSize: "12px", color: "#64748b" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
