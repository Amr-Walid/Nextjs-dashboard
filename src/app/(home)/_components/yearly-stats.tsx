"use client";
import { useMemo, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { YearlyData, TerritoryData } from "@/services/adventureworks.service";
import { CustomTooltip } from "@/components/ui/chart-tooltip";
import { useFilters } from "@/context/FilterContext";
import { cn } from "@/lib/utils";

const REGION_LABELS: Record<string, string> = {
  "All": "كل المناطق",
  "North America": "أمريكا الشمالية",
  "Europe": "أوروبا",
  "Pacific": "المحيط الهادي"
};

export function AWYearlyStats({ 
  yearlyData, 
  territories, 
  totalSales 
}: { 
  yearlyData: YearlyData[],
  territories: TerritoryData[],
  totalSales: number
}) {
  const { filters, isPending } = useFilters();

  const chartData = useMemo(() => {
    let result = yearlyData.map(y => ({ ...y }));

    // 1. Filter by year if selected
    if (filters.year !== "All") {
      result = result.filter(y => y.year === filters.year);
    }

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
        result = result.map(y => ({
          ...y,
          sales: y.sales * ratio,
          profit: y.profit * ratio,
          orders: Math.round(y.orders * ratio),
        }));
      }
    }

    return result;
  }, [yearlyData, filters.year, filters.region, territories, totalSales]);

  return (
    <div className={cn(
      "card-futuristic p-5 h-full flex flex-col transition-all duration-500",
      isPending ? "opacity-70 blur-[1px] scale-[0.99]" : "opacity-100 blur-0 scale-100"
    )}>
      <div className="mb-6 flex justify-between items-center gap-4">
        <div>
          <h3 className="text-base font-bold text-content mb-1">
            المقارنة السنوية
          </h3>
          <p className="text-xs font-medium text-neon-pink">
            الإيرادات والأرباح سنة بسنة
          </p>
        </div>
        {filters.region !== "All" && (
          <span className="text-[10px] px-2 py-1 rounded-lg bg-neon-blue text-white shadow-glow-blue font-bold">
            {REGION_LABELS[filters.region]}
          </span>
        )}
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {chartData.map((y) => (
          <div
            key={y.year}
            className={cn(
              "rounded-xl bg-surface-200 border border-surface-300 p-3 text-center transition-all duration-300 hover:shadow-glow-pink/20 hover:-translate-y-1",
              filters.year !== "All" && filters.year === y.year ? "border-neon-pink ring-1 ring-neon-pink/30" : ""
            )}
          >
            <p className="text-xs font-medium text-content-tertiary mb-1">{y.year}</p>
            <p className="font-black text-content text-base">
              ${(y.sales / 1_000_000).toFixed(1)}M
            </p>
            <p className="text-xs font-medium text-neon-blue mt-0.5">
              ربح: ${(y.profit / 1_000_000).toFixed(1)}M
            </p>
            <p className="text-[11px] text-content-secondary mt-1">{y.orders.toLocaleString()} طلب</p>
          </div>
        ))}
      </div>

      <div className="h-[250px] w-full mt-auto" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" opacity={0.5} />
            <XAxis 
              dataKey="year" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              dy={10}
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`}
            />
            <Tooltip 
              content={<CustomTooltip formatter={(val: any) => `$${val?.toLocaleString() ?? ""}`} />} 
              cursor={{ fill: 'var(--border-default)', opacity: 0.2 }}
            />
            <Bar 
              dataKey="sales" 
              name="الإيرادات" 
              fill="var(--chart-pink)" 
              radius={[4, 4, 0, 0]}
              barSize={12}
              isAnimationActive={true}
              animationDuration={800}
            />
            <Bar 
              dataKey="profit" 
              name="الأرباح" 
              fill="var(--chart-blue)" 
              radius={[4, 4, 0, 0]}
              barSize={12}
              isAnimationActive={true}
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Row */}
      <div className="mt-6 flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-neon-pink shadow-glow-pink" />
          <span className="text-xs font-bold text-content">الإيرادات</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-neon-blue shadow-glow-blue" />
          <span className="text-xs font-bold text-content">الأرباح</span>
        </div>
      </div>
    </div>
  );
}

