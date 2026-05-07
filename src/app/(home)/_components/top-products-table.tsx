"use client";
import { useState } from "react";
import { useFilters } from "@/context/FilterContext";
import { cn } from "@/lib/utils";
import { Dropdown, DropdownContent, DropdownTrigger } from "@/components/ui/dropdown";
import { ChevronDown, Globe, Calendar, X } from "lucide-react";
import type { YearlyData, TerritoryData, ProductData } from "@/services/adventureworks.service";
import { useMemo } from "react";
import { Modal } from "@/components/ui/modal";

const REGION_LABELS: Record<string, string> = {
  "All": "كل المناطق",
  "North America": "أمريكا الشمالية",
  "Europe": "أوروبا",
  "Pacific": "المحيط الهادي"
};

const YEARS = ["All", "2005", "2006", "2007", "2008"];
const REGIONS = ["All", "North America", "Europe", "Pacific"];

export function AWTopProducts({ 
  products,
  yearlyData,
  territories,
  totalSales
}: { 
  products: ProductData[];
  yearlyData: YearlyData[];
  territories: TerritoryData[];
  totalSales: number;
}) {
  const { filters: globalFilters } = useFilters();
  const [localFilter, setLocalFilter] = useState({ year: "All", region: "All" });
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    let ratio = 1;
    const activeYear = localFilter.year !== "All" ? localFilter.year : globalFilters.year;
    const activeRegion = localFilter.region !== "All" ? localFilter.region : globalFilters.region;

    if (activeYear !== "All") {
      const yearMatch = yearlyData.find(y => y.year === activeYear);
      if (yearMatch) ratio *= (yearMatch.sales / totalSales);
    }

    if (activeRegion !== "All") {
      const target = activeRegion.toLowerCase().trim();
      const regionTerritories = territories.filter(t => t.group.toLowerCase().includes(target));
      const regSales = regionTerritories.reduce((s, t) => s + t.sales, 0);
      ratio *= (regSales / totalSales);
    }

    return products.map(p => ({
      ...p,
      sales: p.sales * (ratio || 1),
      qty: Math.round(p.qty * (ratio || 1))
    }));
  }, [products, localFilter, globalFilters, yearlyData, territories, totalSales]);

  const displayProducts = filteredProducts.slice(0, 5);

  const LocalFilterDropdown = ({ type, value, options, openKey, onChange }: any) => {
    const isYear = type === "year";
    const Icon = isYear ? Calendar : Globe;
    
    return (
      <Dropdown isOpen={openDropdown === openKey} setIsOpen={(val) => setOpenDropdown(val ? openKey : null)}>
        <DropdownTrigger className={cn(
          "group flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all duration-300 text-[10px] font-bold border border-transparent",
          value !== "All" ? "bg-blue-50 text-neon-blue border-blue-200" : "text-content-secondary bg-surface-200 hover:bg-surface-300 hover:text-content border-surface-300"
        )}>
          <Icon className="size-3" />
          <span>{value === "All" ? (isYear ? "السنة" : "المنطقة") : (isYear ? value : REGION_LABELS[value])}</span>
          <ChevronDown className={cn("size-2.5 transition-transform", openDropdown === openKey && "rotate-180")} />
        </DropdownTrigger>
        <DropdownContent align="start" className="mt-2 bg-white border border-surface-300 shadow-xl p-1 min-w-[130px] z-[9999] rounded-lg overflow-hidden">
          {options.map((opt: string) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpenDropdown(null); }}
              className={cn(
                "w-full text-right px-3 py-1.5 text-[11px] font-medium rounded-md transition-all",
                value === opt ? "bg-blue-50 text-neon-blue" : "text-content-secondary hover:bg-surface-100"
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
    <div className="card-futuristic p-5 h-full flex flex-col">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-bold text-content">أفضل المنتجات مبيعاً</h3>
            {(globalFilters.year !== "All" || globalFilters.region !== "All") && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-neon-blue/10 text-neon-blue border border-neon-blue/20 font-bold">
                {globalFilters.year !== "All" ? globalFilters.year : ""} {globalFilters.region !== "All" ? REGION_LABELS[globalFilters.region] : ""}
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-neon-pink">أعلى المنتجات من حيث الإيرادات</p>
        </div>

        <div className="flex items-center gap-4">
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
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            className="text-sm font-bold text-neon-blue hover:underline transition-all whitespace-nowrap"
          >
            عرض الكل
          </button>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar flex-1">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="border-b border-surface-300">
              <th className="pb-3 pl-4 font-semibold text-content-tertiary">المنتج</th>
              <th className="pb-3 px-4 font-semibold text-content-tertiary">السعر</th>
              <th className="pb-3 pr-4 font-semibold text-content-tertiary">المبيعات</th>
            </tr>
          </thead>
          <tbody>
            {displayProducts.map((p, i) => {
              let rankStyle = "bg-surface-200 text-content-secondary";
              if (i === 0) {
                rankStyle = "bg-neon-blue text-white";
              } else if (i === 1) {
                rankStyle = "bg-blue-100 text-neon-blue";
              } else if (i === 2) {
                rankStyle = "bg-blue-50 text-neon-blue";
              }

              return (
                <tr
                  key={p.name}
                  className="group border-b border-surface-300/50 hover:bg-surface-300/20 transition-colors duration-200 last:border-0"
                >
                  <td className="py-4 pl-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-black ${rankStyle}`}
                      >
                        {i + 1}
                      </div>
                      <span className="font-bold text-content group-hover:text-neon-blue transition-colors">
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-medium text-content">
                    ${p.listPrice.toFixed(2)}
                  </td>
                  <td className="py-4 pr-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-black text-neon-blue">
                        ${(p.sales / 1000).toFixed(1)}K
                      </span>
                      <span className="text-[10px] font-bold text-content-tertiary uppercase tracking-tighter">
                        {p.qty.toLocaleString()} وحدة
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="جميع المنتجات الأكثر مبيعاً"
      >
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-surface-300">
                <th className="pb-3 pl-4 font-semibold text-content-tertiary">المنتج</th>
                <th className="pb-3 px-4 font-semibold text-content-tertiary">السعر</th>
                <th className="pb-3 pr-4 font-semibold text-content-tertiary">المبيعات</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p, i) => (
                <tr
                  key={p.name}
                  className="group border-b border-surface-300/50 hover:bg-surface-300/20 transition-colors duration-200 last:border-0"
                >
                  <td className="py-4 pl-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold bg-surface-300 text-content-secondary">
                        {i + 1}
                      </div>
                      <span className="font-medium text-content">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-medium text-content">
                    ${p.listPrice.toFixed(2)}
                  </td>
                  <td className="py-4 pr-4 font-bold text-neon-pink text-left">
                    ${(p.sales / 1000).toFixed(1)}K
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
}
