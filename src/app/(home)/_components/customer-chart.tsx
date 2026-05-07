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
import { Dropdown, DropdownContent, DropdownTrigger } from "@/components/ui/dropdown";
import { ChevronDown, Globe, Calendar, X, Users, BarChart3 } from "lucide-react";
import { useFilters } from "@/context/FilterContext";
import { cn } from "@/lib/utils";
import type { YearlyData, TerritoryData } from "@/services/adventureworks.service";

type DistItem = { label: string; count: number };

const REGION_LABELS: Record<string, string> = {
  "All": "كل المناطق",
  "North America": "أمريكا الشمالية",
  "Europe": "أوروبا",
  "Pacific": "المحيط الهادي"
};

const YEARS = ["All", "2005", "2006", "2007", "2008"];
const REGIONS = ["All", "North America", "Europe", "Pacific"];

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

  const calculateScaled = (baseData: DistItem[], local: { year: string, region: string }) => {
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
  };

  const scaledIncome = useMemo(() => calculateScaled(incomeData, incFilter), [incomeData, incFilter, filters, yearlyData, territories, totalCustomers]);
  const scaledGender = useMemo(() => calculateScaled(genderData, genFilter), [genderData, genFilter, filters, yearlyData, territories, totalCustomers]);

  const incTotal = scaledIncome.reduce((s, d) => s + d.count, 0);
  const genTotal = scaledGender.reduce((s, d) => s + d.count, 0);

  const [incLoading, setIncLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);

  const handleIncChange = (key: string, val: string) => {
    setIncLoading(true);
    setIncFilter(prev => ({ ...prev, [key]: val }));
    setOpenInc(null);
    setTimeout(() => setIncLoading(false), 300);
  };

  const handleGenChange = (key: string, val: string) => {
    setGenLoading(true);
    setGenFilter(prev => ({ ...prev, [key]: val }));
    setOpenGen(null);
    setTimeout(() => setGenLoading(false), 300);
  };

  const LocalFilterDropdown = ({ 
    type, 
    value, 
    options, 
    openKey, 
    openDropdown, 
    setOpen, 
    onChange 
  }: any) => {
    const isYear = type === "year";
    const Icon = isYear ? Calendar : Globe;
    const activeColor = isYear ? "bg-neon-pink shadow-glow-pink" : "bg-neon-blue shadow-glow-blue";
    const iconColor = isYear ? "text-neon-pink" : "text-neon-blue";
    
    return (
      <Dropdown isOpen={openDropdown === openKey} setIsOpen={(val) => setOpen(val ? openKey : null)}>
        <DropdownTrigger className={cn(
          "group flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-300 text-[11px] font-bold tracking-tight border border-transparent",
          value !== "All" 
            ? activeColor + " text-white" 
            : "text-content-secondary bg-surface-200/50 hover:bg-surface-300/80 hover:text-content border-surface-300/30"
        )}>
          <Icon className={cn("size-3.5 transition-colors", value !== "All" ? "text-white" : iconColor)} />
          <span>{value === "All" ? (isYear ? "السنة" : "المنطقة") : (isYear ? value : REGION_LABELS[value])}</span>
          <ChevronDown className={cn("size-3 opacity-50 transition-transform duration-300", openDropdown === openKey && "rotate-180")} />
        </DropdownTrigger>
        <DropdownContent align="end" className="mt-2 bg-surface-100/95 backdrop-blur-xl border border-surface-300 shadow-2xl p-1.5 min-w-[150px] z-[9999] rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="px-3 py-1.5 mb-1 text-[10px] font-black text-content-tertiary uppercase tracking-widest border-b border-surface-200">اختر {isYear ? "السنة" : "المنطقة"}</div>
          {options.map((opt: string) => (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={cn(
                "w-full text-right px-3 py-2 text-[13px] font-medium rounded-xl transition-all duration-200 flex items-center justify-between group/item",
                value === opt ? (isYear ? "bg-neon-pink/10 text-neon-pink" : "bg-neon-blue/10 text-neon-blue") : "text-content-secondary hover:bg-surface-200 hover:text-neon-blue"
              )}
            >
              <span className={cn("size-1.5 rounded-full opacity-0 transition-opacity", value === opt && (isYear ? "bg-neon-pink" : "bg-neon-blue"), value === opt && "opacity-100")} />
              {isYear ? (opt === "All" ? "كل السنين" : opt) : REGION_LABELS[opt]}
            </button>
          ))}
        </DropdownContent>
      </Dropdown>
    );
  };

  const FilterGroup = ({ current, openDropdown, setOpen, onChange, reset }: any) => (
    <div className="flex items-center gap-1.5 p-1 bg-surface-200/50 backdrop-blur-md rounded-2xl border border-surface-300/50 shadow-inner">
      <LocalFilterDropdown 
        type="region" 
        value={current.region} 
        options={REGIONS} 
        openKey="region" 
        openDropdown={openDropdown} 
        setOpen={setOpen} 
        onChange={(v: string) => onChange("region", v)} 
      />
      <div className="w-px h-4 bg-surface-300/50" />
      <LocalFilterDropdown 
        type="year" 
        value={current.year} 
        options={YEARS} 
        openKey="year" 
        openDropdown={openDropdown} 
        setOpen={setOpen} 
        onChange={(v: string) => onChange("year", v)} 
      />
      {(current.region !== "All" || current.year !== "All") && (
        <>
          <div className="w-px h-4 bg-surface-300/50" />
          <button
            onClick={reset}
            className="group p-1.5 rounded-xl text-content-tertiary hover:bg-red-500/10 hover:text-red-500 transition-all duration-300"
          >
            <X className="size-3.5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className={cn(
      "flex flex-col gap-4 md:gap-6 h-full transition-all duration-300",
      isPending ? "opacity-60 blur-[1px] scale-[0.995]" : "opacity-100 blur-0 scale-100"
    )}>
      {/* Income Distribution - Top */}
      <div className={cn("flex-1 transition-all duration-300", incLoading && "opacity-50 blur-[1px] scale-[0.99]")}>
        <div className="card-futuristic p-5 h-full flex flex-col relative">
          <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-300 text-neon-blue shadow-glow-blue">
                <BarChart3 size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-content">توزيع الدخل</h3>
                  {(filters.year !== "All" || filters.region !== "All") && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-neon-blue/10 text-neon-blue border border-neon-blue/20 font-bold">
                      {filters.year !== "All" ? filters.year : ""} {filters.region !== "All" ? REGION_LABELS[filters.region] : ""}
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-medium text-neon-blue">{incTotal.toLocaleString()} عميل</p>
              </div>
            </div>
            <div className="relative z-[50]">
              <FilterGroup 
                current={incFilter} 
                openDropdown={openInc} 
                setOpen={setOpenInc} 
                onChange={handleIncChange} 
                reset={() => setIncFilter({ year: "All", region: "All" })} 
              />
            </div>
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
                  tick={{ fill: "var(--text-secondary)", fontSize: 10, fontWeight: 600 }}
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

      {/* Gender Distribution - Bottom */}
      <div className={cn("flex-1 transition-all duration-300", genLoading && "opacity-50 blur-[1px] scale-[0.99]")}>
        <div className="card-futuristic p-5 h-full flex flex-col relative">
          <div className="mb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-300 text-neon-pink shadow-glow-pink">
                <Users size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-content">توزيع النوع</h3>
                  {(filters.year !== "All" || filters.region !== "All") && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-neon-pink/10 text-neon-pink border border-neon-pink/20 font-bold">
                      {filters.year !== "All" ? filters.year : ""} {filters.region !== "All" ? REGION_LABELS[filters.region] : ""}
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-medium text-neon-pink">نسبة الرجال للسيدات</p>
              </div>
            </div>
            <div className="relative z-[50]">
              <FilterGroup 
                current={genFilter} 
                openDropdown={openGen} 
                setOpen={setOpenGen} 
                onChange={handleGenChange} 
                reset={() => setGenFilter({ year: "All", region: "All" })} 
              />
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-around gap-6 mt-auto">
            <div className="relative flex justify-center items-center h-[140px] w-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scaledGender.map(g => ({ name: g.label === "M" ? "رجال" : "سيدات", value: g.count }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
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
                <span className="text-[9px] text-content-tertiary uppercase tracking-wider">الإجمالي</span>
                <span className="text-sm font-bold text-content">
                  {(genTotal / 1000).toFixed(1)}K
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 min-w-[150px]">
              {scaledGender.map((g, i) => (
                <div key={g.label} className="bg-surface-300/20 rounded-xl p-2.5 border border-surface-300/50 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      i === 0 ? 'bg-neon-pink shadow-glow-pink' : 'bg-neon-blue shadow-glow-blue'
                    )} />
                    <span className="text-xs font-medium text-content-secondary">{g.label === "M" ? "رجال" : "سيدات"}</span>
                  </div>
                  <div className="text-sm font-bold text-content">
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
