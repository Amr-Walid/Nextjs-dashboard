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
  Legend,
} from "recharts";
import type { QuarterlyData, TerritoryData } from "@/services/adventureworks.service";
import { useFilters } from "@/context/FilterContext";
import { LocalFilterGroup } from "@/components/ui/local-filter-group";
import { cn } from "@/lib/utils";
import { CustomTooltip } from "@/components/ui/chart-tooltip";

const REGION_LABELS: Record<string, string> = {
  "All": "كل المناطق",
  "North America": "أمريكا الشمالية",
  "Europe": "أوروبا",
  "Pacific": "المحيط الهادي"
};

export function SalesQuarterlyChart({ 
  data, 
  territories, 
  totalSales 
}: { 
  data: QuarterlyData[],
  territories: TerritoryData[],
  totalSales: number
}) {
  const { filters: globalFilters, isPending } = useFilters();
  const [localFilter, setLocalFilter] = useState({ year: "All", region: "All" });
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const chartData = useMemo(() => {
    let result = [...data];
    const activeYear = localFilter.year !== "All" ? localFilter.year : globalFilters.year;
    const activeRegion = localFilter.region !== "All" ? localFilter.region : globalFilters.region;

    // 1. Filter by year
    if (activeYear !== "All") {
      result = result.filter(q => q.quarter.includes(activeYear));
    }

    // 2. Scale by region ratio
    if (activeRegion !== "All") {
      const target = activeRegion.toLowerCase().trim();
      const regionTerritories = territories.filter(t => 
        t.group.toLowerCase().trim().includes(target) || 
        target.includes(t.group.toLowerCase().trim())
      );
      const regSales = regionTerritories.reduce((s, t) => s + t.sales, 0);
      const ratio = totalSales > 0 ? regSales / totalSales : 0;

      if (ratio > 0) {
        result = result.map(q => ({
          ...q,
          sales: q.sales * ratio,
          profit: q.profit * ratio,
        }));
      }
    }

    return result.map(q => ({
      ...q,
      quarter: q.quarter.replace("Q1", "الربع الأول").replace("Q2", "الربع الثاني").replace("Q3", "الربع الثالث").replace("Q4", "الربع الرابع")
    }));
  }, [data, globalFilters, localFilter, territories, totalSales]);

  return (
    <div className={cn(
      "card-futuristic p-5 h-full flex flex-col transition-all duration-500",
      isPending ? "opacity-70 blur-[1px] scale-[0.99]" : "opacity-100 blur-0 scale-100"
    )}>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-bold text-content">المقارنة الربع سنوية</h2>
            {(globalFilters.year !== "All" || globalFilters.region !== "All") && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-neon-blue/10 text-neon-blue border border-neon-blue/20 font-bold">
                {globalFilters.year !== "All" ? globalFilters.year : ""} {globalFilters.region !== "All" ? REGION_LABELS[globalFilters.region] : ""}
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-neon-pink">إيرادات وأرباح كل ربع سنة</p>
        </div>

        <LocalFilterGroup 
          current={localFilter} 
          openDropdown={openDropdown} 
          setOpen={setOpenDropdown} 
          onChange={(key, val) => setLocalFilter(p => ({ ...p, [key]: val }))} 
          reset={() => setLocalFilter({ year: "All", region: "All" })} 
        />
      </div>

      <div className="flex-1 min-h-[450px] w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            layout="vertical"
            margin={{ top: 0, right: 30, left: 10, bottom: 20 }}
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-default)" opacity={0.5} />
            <XAxis 
              type="number"
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: "var(--text-tertiary)", fontSize: 10, fontWeight: 600 }}
              tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`}
            />
            <YAxis 
              dataKey="quarter" 
              type="category"
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: "var(--text-tertiary)", fontSize: 10, fontWeight: 700 }}
              width={110}
              interval={0}
            />
            <Tooltip 
              cursor={{ fill: 'var(--border-default)', opacity: 0.1 }}
              content={<CustomTooltip formatter={(val: any) => `$${val?.toLocaleString() ?? ""}`} />} 
            />
            <Bar 
              name="الإيرادات"
              dataKey="sales" 
              fill="var(--chart-pink)" 
              radius={[0, 4, 4, 0]}
              barSize={(localFilter.year !== "All" || globalFilters.year !== "All") ? 25 : 10}
              isAnimationActive={true}
              animationDuration={800}
            />
            <Bar 
              name="الأرباح"
              dataKey="profit" 
              fill="var(--chart-blue)" 
              radius={[0, 4, 4, 0]}
              barSize={(localFilter.year !== "All" || globalFilters.year !== "All") ? 25 : 10}
              isAnimationActive={true}
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

