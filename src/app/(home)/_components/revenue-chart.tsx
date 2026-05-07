"use client";
import { useState, useMemo, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CustomTooltip } from "@/components/ui/chart-tooltip";
import { cn } from "@/lib/utils";
import { useFilters } from "@/context/FilterContext";

type ChartData = { x: string; y: number };
type TerritoryData = { group: string; sales: number };

const REGION_LABELS: Record<string, string> = {
  "All": "كل المناطق",
  "North America": "أمريكا الشمالية",
  "Europe": "أوروبا",
  "Pacific": "المحيط الهادي"
};

export function AWRevenueChart({ 
  data, 
  territories, 
  totalSales 
}: { 
  data: { sales: ChartData[]; profit: ChartData[] },
  territories: TerritoryData[],
  totalSales: number
}) {
  const { filters, isPending } = useFilters();
  const [range, setRange] = useState<6 | 12 | 24>(24);

  // Filter and Scale data based on Year and Region
  const chartData = useMemo(() => {
    let sales = [...data.sales];
    let profit = [...data.profit];

    // 1. Filter by year if selected
    if (filters.year !== "All") {
      sales = sales.filter(s => s.x.includes(filters.year));
      profit = profit.filter(p => p.x.includes(filters.year));
    } else {
      sales = sales.slice(-range);
      profit = profit.slice(-range);
    }

    let result = sales.map((s, i) => ({
      name: s.x,
      sales: s.y,
      profit: profit[i]?.y ?? 0,
    }));

    // 2. Scale by region ratio if selected
    if (filters.region !== "All") {
      const target = filters.region.toLowerCase().trim();
      const regionTerritories = territories.filter(t => 
        t.group.toLowerCase().trim().includes(target) || 
        target.includes(t.group.toLowerCase().trim())
      );
      const regSales = regionTerritories.reduce((s, t) => s + t.sales, 0);
      const ratio = totalSales > 0 ? regSales / totalSales : 0;

      if (ratio > 0) {
        result = result.map(d => ({
          ...d,
          sales: Math.round(d.sales * ratio),
          profit: Math.round(d.profit * ratio),
        }));
      }
    }

    return result;
  }, [data, range, filters.year, filters.region, territories, totalSales]);

  return (
    <div className={cn(
      "card-futuristic p-5 h-full transition-all duration-500",
      isPending ? "scale-[0.98] opacity-90 blur-[1px]" : "scale-100 opacity-100 blur-0"
    )}>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div>
            <h3 className="text-base font-bold text-content tracking-wide flex items-center gap-2">
              اتجاه الإيرادات والأرباح
              {filters.region !== "All" && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-blue/20 text-neon-blue border border-neon-blue/30">
                  {REGION_LABELS[filters.region]}
                </span>
              )}
            </h3>
            <p className="text-xs font-medium text-neon-pink">
              عرض البيانات لآخر {range === 24 ? "سنتين" : range === 12 ? "سنة" : "6 أشهر"}
            </p>
          </div>
          
          {/* Legend Indicators */}
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-neon-pink" />
              <span className="text-[10px] font-bold text-content-secondary uppercase tracking-wider">إيرادات</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-neon-blue" />
              <span className="text-[10px] font-bold text-content-secondary uppercase tracking-wider">أرباح</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-surface-200 rounded-lg border border-surface-300 w-fit h-fit self-end sm:self-center">
          {[6, 12, 24].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r as any)}
              className={cn(
                "px-3 py-1.5 text-[11px] font-bold rounded-md transition-all duration-300",
                range === r 
                  ? "bg-neon-blue text-white shadow-sm" 
                  : "text-content-tertiary hover:text-content hover:bg-surface-300"
              )}
            >
              {r === 24 ? "24 شهر" : r === 12 ? "12 شهر" : "6 أشهر"}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-[250px] sm:h-[310px] w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-pink)" stopOpacity={0.5} />
                <stop offset="95%" stopColor="var(--chart-pink)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-blue)" stopOpacity={0.5} />
                <stop offset="95%" stopColor="var(--chart-blue)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" opacity={0.5} />
            <XAxis 
              dataKey="name" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              dy={10}
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              width={60}
              tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip 
              content={<CustomTooltip formatter={(val: any) => `$${val?.toLocaleString() ?? ""}`} />} 
              cursor={{ stroke: 'var(--border-default)', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <Area
              type="monotone"
              dataKey="sales"
              name="الإيرادات"
              stroke="var(--chart-pink)"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorSales)"
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-in-out"
              activeDot={{ r: 5, fill: "var(--chart-pink)", strokeWidth: 2, stroke: "#fff" }}
            />
            <Area
              type="monotone"
              dataKey="profit"
              name="الأرباح"
              stroke="var(--chart-blue)"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorProfit)"
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-in-out"
              activeDot={{ r: 5, fill: "var(--chart-blue)", strokeWidth: 2, stroke: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


