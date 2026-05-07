"use client";
import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { CustomTooltip } from "@/components/ui/chart-tooltip";
import { Users, BarChart3 } from "lucide-react";
import { useFilters } from "@/context/FilterContext";
import { cn } from "@/lib/utils";
import type { YearlyData, TerritoryData } from "@/services/adventureworks.service";
import { LocalFilterGroup } from "@/components/ui/local-filter-group";

type DistItem = { label: string; count: number };

const REGION_LABELS: Record<string, string> = {
  "All": "كل المناطق",
  "North America": "أمريكا الشمالية",
  "Europe": "أوروبا",
  "Pacific": "المحيط الهادي"
};

export function AWCustomerChart({
  incomeData,
  genderData,
  yearlyData,
  territories,
  totalCustomers,
}: {
  incomeData: DistItem[];
  genderData: DistItem[];
  yearlyData: YearlyData[];
  territories: TerritoryData[];
  totalCustomers: number;
}) {
  const { filters, isPending } = useFilters();
  const [incFilter, setIncFilter] = useState({ year: "All", region: "All" });
  const [genFilter, setGenFilter] = useState({ year: "All", region: "All" });

  const [openInc, setOpenInc] = useState<string | null>(null);
  const [openGen, setOpenGen] = useState<string | null>(null);

  const calculateScaled = useMemo(() => (baseData: DistItem[], local: { year: string, region: string }) => {
    let finalRatio = 1;
    const activeYear = local.year !== "All" ? local.year : filters.year;
    const activeRegion = local.region !== "All" ? local.region : filters.region;

    if (activeYear !== "All") {
      const yearMatch = yearlyData.find(y => y.year === activeYear);
      if (yearMatch) {
        const totalYearlyCust = yearlyData.reduce((s, y) => s + y.customers, 0) || totalCustomers;
        finalRatio *= (yearMatch.customers / totalYearlyCust);
      }
    }

    if (activeRegion !== "All") {
      const target = activeRegion.toLowerCase().trim();
      const regionTerritories = territories.filter(t => t.group.toLowerCase().includes(target));
      const regOrders = regionTerritories.reduce((s, t) => s + (t.orders || 0), 0);
      const totalOrdersBase = territories.reduce((s, t) => s + (t.orders || 0), 0) || 1;
      const regionRatio = regOrders / totalOrdersBase;
      if (regionRatio > 0) finalRatio *= regionRatio;
    }

    return baseData.map(d => ({
      label: d.label
        .replace("70k - 100k", "70 ألف - 100 ألف")
        .replace("40k - 70k", "40 ألف - 70 ألف")
        .replace("أكثر من 100k", "أكثر من 100 ألف")
        .replace("أقل من 40k", "أقل من 40 ألف"),
      count: Math.round(d.count * (isNaN(finalRatio) || finalRatio === 0 ? 1 : finalRatio))
    }));
  }, [filters, yearlyData, territories, totalCustomers]);

  const scaledIncome = useMemo(() => calculateScaled(incomeData, incFilter), [calculateScaled, incomeData, incFilter]);
  const scaledGender = useMemo(() => calculateScaled(genderData, genFilter), [calculateScaled, genderData, genFilter]);

  const incTotal = scaledIncome.reduce((s, d) => s + d.count, 0);
  const genTotal = scaledGender.reduce((s, d) => s + d.count, 0);

  return (
    <div className={cn(
      "flex flex-col gap-4 md:gap-6 h-full transition-all duration-300",
      isPending ? "opacity-60 blur-[1px] scale-[0.995]" : "opacity-100 blur-0 scale-100"
    )}>
      {/* Income Distribution */}
      <div className="flex-1">
        <div className="card-futuristic p-5 h-full flex flex-col relative">
          <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-neon-blue">
                <BarChart3 size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-content">توزيع الدخل</h3>
                  {(filters.year !== "All" || filters.region !== "All") && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-neon-blue font-bold">
                      {filters.year !== "All" ? filters.year : ""} {filters.region !== "All" ? REGION_LABELS[filters.region] : ""}
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-bold text-content-tertiary uppercase tracking-tight">{incTotal.toLocaleString()} عميل</p>
              </div>
            </div>
            <LocalFilterGroup 
              current={incFilter} 
              openDropdown={openInc} 
              setOpen={setOpenInc} 
              onChange={(key, val) => setIncFilter(p => ({ ...p, [key]: val }))} 
              reset={() => setIncFilter({ year: "All", region: "All" })} 
            />
          </div>

          <div className="h-[180px] w-full mt-auto" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scaledIncome} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" opacity={0.5} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="label"
                  type="category"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "var(--text-secondary)", fontSize: 10, fontWeight: 700 }}
                  width={100}
                />
                <Tooltip 
                  cursor={false} 
                  content={<CustomTooltip formatter={(v: any) => `${v.toLocaleString()} عميل`} />} 
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={12}>
                  {scaledIncome.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--chart-pink)' : 'var(--chart-blue)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Gender Distribution */}
      <div className="flex-1">
        <div className="card-futuristic p-5 h-full flex flex-col relative">
          <div className="mb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-neon-pink">
                <Users size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-content">توزيع النوع</h3>
                  {(filters.year !== "All" || filters.region !== "All") && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-pink-50 text-neon-pink font-bold">
                      {filters.year !== "All" ? filters.year : ""} {filters.region !== "All" ? REGION_LABELS[filters.region] : ""}
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-bold text-content-tertiary uppercase tracking-tight">نسبة الرجال للسيدات</p>
              </div>
            </div>
            <LocalFilterGroup 
              current={genFilter} 
              openDropdown={openGen} 
              setOpen={setOpenGen} 
              onChange={(key, val) => setGenFilter(p => ({ ...p, [key]: val }))} 
              reset={() => setGenFilter({ year: "All", region: "All" })} 
            />
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-around gap-10 mt-auto py-4">
            <div className="relative flex justify-center items-center h-[240px] w-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scaledGender.map(g => ({ name: g.label, value: g.count }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="var(--chart-pink)" />
                    <Cell fill="var(--chart-blue)" />
                  </Pie>
                  <Tooltip content={<CustomTooltip formatter={(v: any) => `${v.toLocaleString()} عميل`} />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-content-tertiary uppercase tracking-widest font-black">الإجمالي</span>
                <span className="text-2xl font-black text-content">
                  {(genTotal / 1000).toFixed(1)}K
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4 min-w-[180px]">
              {scaledGender.map((g, i) => (
                <div key={g.label} className="bg-surface-200 rounded-2xl p-4 border border-surface-300/50 flex items-center justify-between gap-6 hover:bg-surface-300 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-3 w-3 rounded-full",
                      i === 0 ? 'bg-neon-pink' : 'bg-neon-blue'
                    )} />
                    <span className="text-sm font-bold text-content-secondary">{g.label}</span>
                  </div>
                  <div className="text-lg font-black text-content">
                    {g.count.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
