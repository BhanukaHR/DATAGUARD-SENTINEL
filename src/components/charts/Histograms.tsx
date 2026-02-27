import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { BIN_COLORS } from "../../utils/constants";

interface BinData {
  range: string;
  count: number;
  binIndex: number;
}

export function TrsHistogram({ data }: { data: BinData[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h3 className="text-sm font-medium text-slate-900 mb-4">TRS Score Distribution</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barSize={28}>
          <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px" }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {data.map((entry) => (<Cell key={entry.range} fill={BIN_COLORS[entry.binIndex] || "#94a3b8"} />))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BrsHistogram({ data }: { data: BinData[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h3 className="text-sm font-medium text-slate-900 mb-4">BRS Score Distribution</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barSize={28}>
          <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px" }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {data.map((entry) => (<Cell key={entry.range} fill={BIN_COLORS[entry.binIndex] || "#94a3b8"} />))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
