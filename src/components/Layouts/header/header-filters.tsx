"use client";
import React, { useState } from "react";
import { useFilters } from "@/context/FilterContext";
import { cn } from "@/lib/utils";
import { Dropdown, DropdownContent, DropdownTrigger } from "@/components/ui/dropdown";
import { ChevronDown, Globe, Calendar, X, Sparkles } from "lucide-react";

const REGION_LABELS: Record<string, string> = {
  "All": "كل المناطق",
  "North America": "أمريكا الشمالية",
  "Europe": "أوروبا",
  "Pacific": "المحيط الهادي"
};

const REGIONS = ["All", "North America", "Europe", "Pacific"];
const YEARS = ["All", "2005", "2006", "2007", "2008"];

export function HeaderFilters() {
  const { filters, setFilters } = useFilters();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setOpenDropdown(null);
  };

  const resetFilters = () => {
    setFilters({ region: "All", year: "All", category: "All" });
  };

  const hasFilters = filters.region !== "All" || filters.year !== "All";

  return (
    <div className="flex items-center gap-1.5 p-1 bg-surface-200/50 backdrop-blur-md rounded-2xl border border-surface-300/50 shadow-inner">
      {/* Region Filter */}
      <Dropdown isOpen={openDropdown === "region"} setIsOpen={(val) => setOpenDropdown(val ? "region" : null)}>
        <DropdownTrigger className={cn(
          "group flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-300 text-[11px] font-bold tracking-tight",
          filters.region !== "All" 
            ? "bg-neon-blue text-white shadow-glow-blue" 
            : "text-content-secondary hover:bg-surface-300/80 hover:text-content"
        )}>
          <Globe className={cn("size-3.5 transition-colors", filters.region !== "All" ? "text-white" : "text-neon-blue")} />
          <span>{filters.region === "All" ? "المنطقة" : REGION_LABELS[filters.region]}</span>
          <ChevronDown className={cn("size-3 opacity-50 transition-transform duration-300", openDropdown === "region" && "rotate-180")} />
        </DropdownTrigger>
        <DropdownContent align="start" className="mt-2 bg-surface-100/95 backdrop-blur-xl border border-surface-300 shadow-2xl p-1.5 min-w-[160px] z-[9999] rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="px-3 py-1.5 mb-1 text-[10px] font-black text-content-tertiary uppercase tracking-widest border-b border-surface-200">اختر المنطقة</div>
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => updateFilter("region", r)}
              className={cn(
                "w-full text-right px-3 py-2 text-[13px] font-medium rounded-xl transition-all duration-200 flex items-center justify-between group/item",
                filters.region === r ? "bg-neon-blue/10 text-neon-blue" : "text-content-secondary hover:bg-surface-200 hover:text-neon-blue"
              )}
            >
              <span className={cn("size-1.5 rounded-full bg-neon-blue opacity-0 transition-opacity", filters.region === r && "opacity-100")} />
              {REGION_LABELS[r]}
            </button>
          ))}
        </DropdownContent>
      </Dropdown>

      <div className="w-px h-4 bg-surface-300/50" />

      {/* Year Filter */}
      <Dropdown isOpen={openDropdown === "year"} setIsOpen={(val) => setOpenDropdown(val ? "year" : null)}>
        <DropdownTrigger className={cn(
          "group flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-300 text-[11px] font-bold tracking-tight",
          filters.year !== "All" 
            ? "bg-neon-pink text-white shadow-glow-pink" 
            : "text-content-secondary hover:bg-surface-300/80 hover:text-content"
        )}>
          <Calendar className={cn("size-3.5 transition-colors", filters.year !== "All" ? "text-white" : "text-neon-pink")} />
          <span>{filters.year === "All" ? "السنة" : filters.year}</span>
          <ChevronDown className={cn("size-3 opacity-50 transition-transform duration-300", openDropdown === "year" && "rotate-180")} />
        </DropdownTrigger>
        <DropdownContent align="start" className="mt-2 bg-surface-100/95 backdrop-blur-xl border border-surface-300 shadow-2xl p-1.5 min-w-[140px] z-[9999] rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="px-3 py-1.5 mb-1 text-[10px] font-black text-content-tertiary uppercase tracking-widest border-b border-surface-200">اختر السنة</div>
          {YEARS.map((y) => (
            <button
              key={y}
              onClick={() => updateFilter("year", y)}
              className={cn(
                "w-full text-right px-3 py-2 text-[13px] font-medium rounded-xl transition-all duration-200 flex items-center justify-between group/item",
                filters.year === y ? "bg-neon-pink/10 text-neon-pink" : "text-content-secondary hover:bg-surface-200 hover:text-neon-pink"
              )}
            >
              <span className={cn("size-1.5 rounded-full bg-neon-pink opacity-0 transition-opacity", filters.year === y && "opacity-100")} />
              {y === "All" ? "كل السنوات" : y}
            </button>
          ))}
        </DropdownContent>
      </Dropdown>

      {/* Reset */}
      {hasFilters && (
        <>
          <div className="w-px h-4 bg-surface-300/50" />
          <button
            onClick={resetFilters}
            className="group p-1.5 rounded-xl text-content-tertiary hover:bg-red-500/10 hover:text-red-500 transition-all duration-300"
            title="إلغاء الفلاتر"
          >
            <X className="size-3.5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </>
      )}
    </div>
  );
}

