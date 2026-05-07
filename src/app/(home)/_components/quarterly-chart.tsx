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
import { cn } from "@/lib/utils";
import { CustomTooltip } from "@/components/ui/chart-tooltip";
import { Dropdown, DropdownContent, DropdownTrigger } from "@/components/ui/dropdown";
import { ChevronDown, Globe, Calendar, X } from "lucide-react";

const REGION_LABELS: Record<string, string> = {
  "All": "كل المناطق",
  "North America": "أمريكا الشمالية",
  "Europe": "أوروبا",
  "Pacific": "المحيط الهادي"
};

const YEARS = ["All", "2005", "2006", "2007", "2008"];
const REGIONS = ["All", "North America", "Europe", "Pacific"];

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

  const LocalFilterDropdown = ({ type, value, options, openKey, onChange }: any) => {
    const isYear = type === "year";
    const Icon = isYear ? Calendar : Globe;
    const activeColor = isYear ? "bg-neon-pink shadow-glow-pink" : "bg-neon-blue shadow-glow-blue";
    
    return (
      <Dropdown isOpen={openDropdown === openKey} setIsOpen={(val) => setOpenDropdown(val ? openKey : null)}>
        <DropdownTrigger className={cn(
          "group flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all duration-300 text-[10px] font-bold border border-transparent",
          value !== "All" ? activeColor + " text-white" : "text-content-secondary bg-surface-200/50 hover:bg-surface-300/80 hover:text-content border-surface-300/30"
        )}>
          <Icon className="size-3" />
          <span>{value === "All" ? (isYear ? "السنة" : "المنطقة") : (isYear ? value : REGION_LABELS[value])}</span>
          <ChevronDown className={cn("size-2.5 transition-transform", openDropdown === openKey && "rotate-180")} />
        </DropdownTrigger>
        <DropdownContent align="start" className="mt-2 bg-surface-100/95 backdrop-blur-xl border border-surface-300 shadow-2xl p-1 min-w-[130px] z-[9999] rounded-xl overflow-hidden">
          {options.map((opt: string) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpenDropdown(null); }}
              className={cn(
                "w-full text-right px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all",
                value === opt ? "bg-neon-blue/10 text-neon-blue" : "text-content-secondary hover:bg-surface-200"
              )}
            >
              {isYear ? (opt === "All" ? "كل السنين" : opt) : REGION_LABELS[opt]}
            </button>
          ))}
        </DropdownContent>
      </Dropdown>
    );
  };

  return (
    <div className={cn(
      "card-futuristic p-5 h-full flex flex-col transition-all duration-500",
      isPending ? "opacity-70 blur-[1px] scale-[0.99]" : "opacity-100 blur-0 scale-100"
    )}>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-bold text-content">المقارنة الربع سنوية</h3>
            {(globalFilters.year !== "All" || globalFilters.region !== "All") && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-neon-blue/10 text-neon-blue border border-neon-blue/20 font-bold">
                {globalFilters.year !== "All" ? globalFilters.year : ""} {globalFilters.region !== "All" ? REGION_LABELS[globalFilters.region] : ""}
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-neon-pink">إيرادات وأرباح كل ربع سنة</p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-surface-200/50 rounded-2xl border border-surface-300/50">
          <LocalFilterDropdown 
            type="region" 
            value={localFilter.region} 
            options={REGIONS} 
            openKey="region" 
            onChange={(v: string) => setLocalFilter(p => ({ ...p, region: v }))} 
          />
          <LocalFilterDropdown 
            type="year" 
            value={localFilter.year} 
            options={YEARS} 
            openKey="year" 
            onChange={(v: string) => setLocalFilter(p => ({ ...p, year: v }))} 
          />
          {(localFilter.region !== "All" || localFilter.year !== "All") && (
            <button
              onClick={() => setLocalFilter({ year: "All", region: "All" })}
              className="p-1.5 text-content-tertiary hover:text-red-500 transition-colors"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
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

