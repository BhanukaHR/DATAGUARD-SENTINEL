import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export function AgentStatusDonut({ data }: { data: { name: string; value: number; color: string }[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h3 className="text-sm font-medium text-slate-900 mb-4">Agent Status</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
            dataKey="value" isAnimationActive={false}>
            {data.map((e) => (<Cell key={e.name} fill={e.color} />))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px" }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={((value: any, name: any) => [`${value ?? 0} agents`, name]) as any} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-xs text-slate-600">{d.name}: {d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
