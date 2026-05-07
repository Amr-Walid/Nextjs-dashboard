"use client";
import { useEffect, useState, useMemo } from "react";
import type { KPIs, YearlyData, TerritoryData } from "@/services/adventureworks.service";
import { DollarSign, TrendingUp, Package, Percent } from "lucide-react";
import { useFilters } from "@/context/FilterContext";
import { cn } from "@/lib/utils";

const fmt = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `$${(n / 1_000).toFixed(1)}K`
      : `$${n.toFixed(0)}`;

const fmtNum = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(1)}K`
      : `${n}`;

const REGION_LABELS: Record<string, string> = {
  "All": "كل المناطق",
  "North America": "أمريكا الشمالية",
  "Europe": "أوروبا",
  "Pacific": "المحيط الهادي"
};

export function AWKPICards({ 
  kpis, 
  yearlyData,
  territories
}: { 
  kpis: KPIs, 
  yearlyData: YearlyData[],
  territories: TerritoryData[]
}) {
  const { filters, isPending } = useFilters();

  // Recalculate KPIs based on Year AND Region
  const currentKPIs = useMemo(() => {
    // Calculate accurate global totals from territories/groups for consistency
    const globalSales = territories.reduce((s, t) => s + t.sales, 0);
    const globalProfit = territories.reduce((s, t) => s + t.profit, 0);
    const globalOrders = territories.reduce((s, t) => s + t.orders, 0);

    let result = { 
      ...kpis,
      totalSales: globalSales,
      totalProfit: globalProfit,
      totalOrders: globalOrders,
    };

    // 1. Base: Year Filter
    if (filters.year !== "All") {
      const yearMatch = yearlyData.find(y => y.year === filters.year);
      if (yearMatch) {
        // Use ratio of the year from the yearly data
        const yearRatio = yearMatch.sales / kpis.totalSales;
        result.totalSales = globalSales * yearRatio;
        result.totalProfit = globalProfit * yearRatio;
        result.totalOrders = Math.round(globalOrders * yearRatio);
        result.totalQty = kpis.totalQty * yearRatio;
        result.totalCustomers = kpis.totalCustomers * yearRatio;
      }
    }

    // 2. Scale: Region Filter (Ratio Logic)
    if (filters.region !== "All") {
      const target = filters.region.toLowerCase().trim();
      const regionTerritories = territories.filter(t => 
        t.group.toLowerCase().trim().includes(target) || 
        target.includes(t.group.toLowerCase().trim())
      );
      const regSales = regionTerritories.reduce((s, t) => s + t.sales, 0);
      const ratio = globalSales > 0 ? regSales / globalSales : 0;

      if (ratio > 0) {
        result.totalSales *= ratio;
        result.totalProfit *= ratio;
        result.totalOrders = Math.round(result.totalOrders * ratio);
        result.totalQty = Math.round(result.totalQty * ratio);
        result.totalCustomers = Math.round(result.totalCustomers * ratio);
      }
    }

    // Recalculate derived metrics
    result.profitMargin = (result.totalProfit / result.totalSales) * 100;
    result.avgOrderValue = result.totalSales / result.totalOrders;

    return result;
  }, [filters, kpis, yearlyData, territories]);

  const cards = [
    {
      title: "إجمالي الإيرادات",
      value: fmt(currentKPIs.totalSales),
      sub: `متوسط الطلب ${fmt(currentKPIs.avgOrderValue)}`,
      icon: <DollarSign size={20} />,
      accent: "bg-gradient-to-r from-neon-crimson to-transparent",
      hoverGlow: "hover:shadow-glow-crimson hover:border-neon-crimson/50",
      iconBg: "bg-surface-300 text-neon-crimson shadow-glow-crimson",
    },
    {
      title: "إجمالي الأرباح",
      value: fmt(currentKPIs.totalProfit),
      sub: `هامش الربح ${currentKPIs.profitMargin.toFixed(1)}%`,
      icon: <TrendingUp size={20} />,
      accent: "bg-gradient-to-r from-neon-blue to-transparent",
      hoverGlow: "hover:shadow-glow-blue hover:border-neon-blue/50",
      iconBg: "bg-surface-300 text-neon-blue shadow-glow-blue",
    },
    {
      title: "إجمالي الطلبات",
      value: fmtNum(currentKPIs.totalOrders),
      sub: `${fmtNum(currentKPIs.totalQty)} وحدة مباعة`,
      icon: <Package size={20} />,
      accent: "bg-gradient-to-r from-neon-amber to-transparent",
      hoverGlow: "hover:shadow-glow-amber hover:border-neon-amber/50",
      iconBg: "bg-surface-300 text-neon-amber shadow-glow-amber",
    },
    {
      title: "هامش الربح",
      value: `${currentKPIs.profitMargin.toFixed(1)}%`,
      sub: `إجمالي ${fmtNum(currentKPIs.totalCustomers)} عميل`,
      icon: <Percent size={20} />,
      accent: "bg-gradient-to-r from-neon-amber to-transparent",
      hoverGlow: "hover:shadow-glow-amber hover:border-neon-amber/50",
      iconBg: "bg-surface-300 text-neon-amber shadow-glow-amber",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c, i) => (
        <div
          key={c.title}
          className={cn(
            "group relative overflow-hidden rounded-2xl border border-surface-300 bg-surface-200 p-5 shadow-card transition-all duration-500",
            c.hoverGlow,
            isPending && "scale-[0.97] opacity-80 blur-[0.5px]"
          )}
        >
          {/* Top accent bar */}
          <div className={cn("absolute inset-x-0 top-0 h-0.5 opacity-80", c.accent)} />

          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="mb-1 text-xs font-medium text-content-secondary truncate">
                {c.title}
              </p>
              <div className="flex items-baseline gap-1.5">
                <p className="text-2xl font-bold tracking-tight text-content">
                  {c.value}
                </p>
                {(filters.year !== "All" || filters.region !== "All") && (
                  <span className="text-[9px] font-bold text-neon-pink uppercase whitespace-nowrap">
                    في {filters.year !== "All" ? filters.year : ""} {filters.region !== "All" ? REGION_LABELS[filters.region] : ""}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-[11px] text-content-tertiary truncate">
                {c.sub}
              </p>
            </div>

            <div className={cn(
              "ml-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110",
              c.iconBg
            )}>
              {c.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


