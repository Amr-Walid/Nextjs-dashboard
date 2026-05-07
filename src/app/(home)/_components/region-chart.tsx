"use client";
import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { GroupData, YearlyData } from "@/services/adventureworks.service";
import { CustomTooltip } from "@/components/ui/chart-tooltip";
import { useFilters } from "@/context/FilterContext";
import { cn } from "@/lib/utils";

const REGION_LABELS: Record<string, string> = {
  "North America": "أمريكا الشمالية",
  Europe: "أوروبا",
  Pacific: "المحيط الهادي",
};

export function AWRegionChart({ 
  groups, 
  yearlyData, 
  totalSales 
}: { 
  groups: GroupData[],
  yearlyData: YearlyData[],
  totalSales: number
}) {
  const { filters, isPending } = useFilters();
  const [metric, setMetric] = useState<"sales" | "profit" | "orders">("sales");

  const filteredGroups = useMemo(() => {
    let result = groups.filter((g) => g.group !== "NA").map(g => ({ ...g }));

    // 1. Apply Year Ratio Logic
    if (filters.year !== "All") {
      const yearMatch = yearlyData.find(y => y.year === filters.year);
      if (yearMatch) {
        const yearRatio = totalSales > 0 ? yearMatch.sales / totalSales : 0;
        // Scale metrics based on year ratio
        result = result.map(g => ({ 
          ...g, 
          sales: g.sales * yearRatio,
          profit: g.profit * yearRatio,
          orders: Math.round(g.orders * yearRatio)
        }));
      }
    }

    // 2. Apply Region Filter
    if (filters.region !== "All") {
      const target = filters.region.toLowerCase().trim();
      result = result.filter(g => 
        g.group.toLowerCase().trim().includes(target) || 
        target.includes(g.group.toLowerCase().trim())
      );
    }
    return result;
  }, [groups, filters.region, filters.year, yearlyData, totalSales]);

  const totalValue = filteredGroups.reduce((s, g) => s + (g[metric] || 0), 0);

  const chartData = filteredGroups.map((g) => ({
    name: REGION_LABELS[g.group] ?? g.group,
    value: g[metric],
  }));

  const CHAT_COLORS = [
    "var(--chart-pink)",
    "var(--chart-blue)",
    "var(--chart-amber)",
    "var(--chart-cyan)",
  ];

  const formatVal = (v: number) => {
    if (metric === "orders") return v.toLocaleString();
    return `$${(v / 1_000_000).toFixed(1)}M`;
  };

  return (
    <div className={cn(
      "card-futuristic p-5 h-full flex flex-col transition-all duration-500",
      isPending ? "opacity-70 blur-[1px] scale-[0.99]" : "opacity-100 blur-0 scale-100"
    )}>
      <div className="mb-4 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-base font-bold text-content">توزيع المناطق</h3>
            <p className="text-[10px] font-medium text-neon-pink uppercase tracking-wider">تحليل {metric === "sales" ? "المبيعات" : metric === "profit" ? "الأرباح" : "الطلبات"}</p>
          </div>
          <div className="flex bg-surface-200 p-1 rounded-lg border border-surface-300">
            {[
              { id: "sales", label: "مبيعات" },
              { id: "profit", label: "أرباح" },
              { id: "orders", label: "طلبات" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMetric(m.id as any)}
                className={cn(
                  "px-2.5 py-1 text-[10px] font-bold rounded-md transition-all duration-300",
                  metric === m.id 
                    ? "bg-neon-blue text-white shadow-sm" 
                    : "text-content-tertiary hover:text-content hover:bg-surface-300"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="relative mb-4 flex justify-center items-center h-[200px] sm:h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
                isAnimationActive={true}
                animationDuration={800}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHAT_COLORS[index % CHAT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                content={<CustomTooltip formatter={(val: any) => metric === "orders" ? val.toLocaleString() : `$${val?.toLocaleString() ?? ""}`} />} 
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Centered Total Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[9px] text-content-tertiary uppercase font-black tracking-tighter">إجمالي {metric === "sales" ? "المبيعات" : metric === "profit" ? "الأرباح" : "الطلبات"}</span>
            <span className="text-lg font-black text-content">
              {formatVal(totalValue)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {filteredGroups.map((group, index) => {
            const colors = ["bg-neon-pink", "bg-neon-blue", "bg-neon-amber", "bg-neon-cyan"];
            const pct = totalValue > 0 ? ((group[metric] / totalValue) * 100) : 0;
            const label = REGION_LABELS[group.group] ?? group.group;
            return (
              <div key={group.group} className="flex items-center justify-between p-2 rounded-xl bg-surface-200/50 border border-transparent hover:border-surface-300 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${colors[index % colors.length]}`} />
                  <span className="text-xs font-bold text-content-body">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-content-tertiary">({pct.toFixed(1)}%)</span>
                  <span className="text-xs font-black text-content">{formatVal(group[metric])}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


