"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { GroupData } from "@/services/adventureworks.service";
import { CustomTooltip } from "@/components/ui/chart-tooltip";

const REGION_LABELS: Record<string, string> = {
  "North America": "أمريكا الشمالية",
  Europe: "أوروبا",
  Pacific: "المحيط الهادئ",
};

export function AWRegionChart({ groups }: { groups: GroupData[] }) {
  const validGroups = groups.filter((g) => g.group !== "NA");
  const total = validGroups.reduce((s, g) => s + g.sales, 0);

  const chartData = validGroups.map((g) => ({
    name: REGION_LABELS[g.group] ?? g.group,
    value: g.sales,
  }));

  const CHAT_COLORS = [
    "var(--chart-pink)",
    "var(--chart-blue)",
    "var(--chart-amber)",
    "var(--chart-cyan)",
  ];

  return (
    <div className="card-futuristic p-5 h-full flex flex-col">
      <div className="mb-6 flex justify-between gap-4 sm:flex-col sm:items-start md:flex-row md:items-center">
        <div>
          <h3 className="text-base font-bold text-content">المبيعات حسب المنطقة</h3>
          <p className="text-xs font-medium text-neon-pink">توزيع الإيرادات جغرافياً</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="relative mb-4 flex justify-center items-center h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
                isAnimationActive={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHAT_COLORS[index % CHAT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                content={<CustomTooltip formatter={(val: any) => `$${val?.toLocaleString() ?? ""}`} />} 
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Centered Total Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-content-tertiary">الإجمالي</span>
            <span className="text-xl font-bold text-content">
              ${(total / 1_000_000).toFixed(1)}M
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {validGroups.map((group, index) => {
            const colors = ["bg-neon-pink", "bg-neon-blue", "bg-neon-amber", "bg-neon-cyan"];
            const glowColors = ["shadow-glow-pink", "shadow-glow-blue", "shadow-glow-amber", "shadow-glow-cyan"];
            const pct = (group.sales / total) * 100;
            const label = REGION_LABELS[group.group] ?? group.group;
            return (
              <div key={group.group} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${colors[index % colors.length]} ${glowColors[index % glowColors.length]}`} />
                  <span className="text-sm font-medium text-content-body">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-content-tertiary">({pct.toFixed(1)}%)</span>
                  <span className="text-sm font-bold text-content">${(group.sales / 1_000_000).toFixed(1)}M</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
