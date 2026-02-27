import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from "recharts";
import { format } from "date-fns";

interface BrsTrendPoint {
  date: string;
  brs: number;
}

const RISK_ZONES = [
  { y1: 0, y2: 30, fill: "#dcfce7", label: "Low" },
  { y1: 30, y2: 55, fill: "#fef9c3", label: "Medium" },
  { y1: 55, y2: 75, fill: "#ffedd5", label: "High" },
  { y1: 75, y2: 100, fill: "#fee2e2", label: "Critical" },
];

export function BrsTrendChart({ data }: { data: BrsTrendPoint[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h3 className="text-sm font-medium text-slate-900 mb-4">Behavioral Risk Score Trend</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          {RISK_ZONES.map((zone) => (
            <ReferenceArea
              key={zone.label}
              y1={zone.y1}
              y2={zone.y2}
              fill={zone.fill}
              fillOpacity={0.5}
              ifOverflow="extendDomain"
            />
          ))}
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickFormatter={(v) => format(new Date(v), "MMM d")}
          />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
            labelFormatter={(v) => format(new Date(v as string), "MMM d, yyyy")}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={((v: any) => [(v ?? 0).toFixed(1), "BRS"]) as any}
          />
          <Line
            type="monotone"
            dataKey="brs"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 3 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
