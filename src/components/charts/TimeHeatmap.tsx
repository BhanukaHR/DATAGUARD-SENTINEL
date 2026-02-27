import { useMemo } from "react";

interface HeatmapCell {
  hour: number;
  day: number; // 0=Sun, 6=Sat
  count: number;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getColor(count: number, max: number): string {
  if (count === 0) return "#f1f5f9";
  const ratio = count / max;
  if (ratio < 0.25) return "#dbeafe";
  if (ratio < 0.5) return "#93c5fd";
  if (ratio < 0.75) return "#3b82f6";
  return "#1e3a8a";
}

export function TimeHeatmap({ data }: { data: HeatmapCell[] }) {
  const { grid, max } = useMemo(() => {
    const g: Record<string, number> = {};
    let m = 0;
    for (const cell of data) {
      const key = `${cell.day}-${cell.hour}`;
      g[key] = (g[key] || 0) + cell.count;
      if (g[key] > m) m = g[key];
    }
    return { grid: g, max: m };
  }, [data]);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h3 className="text-sm font-medium text-slate-900 mb-4">Activity Heatmap (Hour × Day)</h3>
      <div className="overflow-x-auto">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="w-10" />
              {HOURS.map((h) => (
                <th key={h} className="text-[10px] text-slate-500 font-normal px-0.5 text-center w-6">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day, di) => (
              <tr key={day}>
                <td className="text-xs text-slate-600 pr-2 text-right">{day}</td>
                {HOURS.map((h) => {
                  const count = grid[`${di}-${h}`] || 0;
                  return (
                    <td key={h} className="p-0.5">
                      <div
                        className="w-5 h-5 rounded-sm cursor-default"
                        style={{ backgroundColor: getColor(count, max) }}
                        title={`${day} ${h}:00 — ${count} events`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-1 mt-3">
        <span className="text-[10px] text-slate-500">Less</span>
        {["#f1f5f9", "#dbeafe", "#93c5fd", "#3b82f6", "#1e3a8a"].map((c) => (
          <div key={c} className="w-4 h-4 rounded-sm" style={{ backgroundColor: c }} />
        ))}
        <span className="text-[10px] text-slate-500">More</span>
      </div>
    </div>
  );
}
