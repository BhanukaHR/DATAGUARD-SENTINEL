import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ChannelData {
  name: string;
  value: number;
  percentage: number;
}

const COLORS: Record<string, string> = {
  Browser: "#3b82f6", Clipboard: "#8b5cf6", USB: "#f97316",
  AiApplication: "#ef4444", AI: "#ef4444", FileSystem: "#6b7280",
  Email: "#14b8a6", FTP: "#eab308", Ftp: "#eab308",
  CloudSync: "#06b6d4", EnterpriseApp: "#a855f7", Unknown: "#94a3b8",
};

export function ChannelPieChart({ data, height = 280 }: { data: ChannelData[]; height?: number }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderLabel = ({ percentage }: any) => (percentage > 5 ? `${percentage}%` : "");

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h3 className="text-sm font-medium text-slate-900 mb-4">Upload Channels</h3>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2}
            dataKey="value" label={renderLabel} isAnimationActive={false}>
            {data.map((entry) => (<Cell key={entry.name} fill={COLORS[entry.name] || "#94a3b8"} />))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", fontSize: "13px" }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={((value: any, name: any) => [`${value ?? 0} events`, name]) as any} />
          <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8}
            wrapperStyle={{ fontSize: "12px", color: "#64748b" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
