"use client";
import React from "react";
import { X } from "lucide-react";
import { LocalFilterDropdown } from "./local-filter-dropdown";
import { cn } from "@/lib/utils";

const YEARS = ["All", "2005", "2006", "2007", "2008"];
const REGIONS = ["All", "North America", "Europe", "Pacific"];

type LocalFilterGroupProps = {
  current: { year: string; region: string };
  openDropdown: string | null;
  setOpen: (key: string | null) => void;
  onChange: (key: string, val: string) => void;
  reset: () => void;
  className?: string;
};

export function LocalFilterGroup({ 
  current, 
  openDropdown, 
  setOpen, 
  onChange, 
  reset,
  className
}: LocalFilterGroupProps) {
  return (
    <div className={cn("flex items-center gap-1.5 p-1 bg-surface-200 rounded-xl border border-surface-300", className)}>
      <LocalFilterDropdown 
        type="region" 
        value={current.region} 
        options={REGIONS} 
        openKey="region" 
        openDropdown={openDropdown} 
        setOpen={setOpen} 
        onChange={(v: string) => onChange("region", v)} 
      />
      <div className="w-px h-4 bg-surface-300" />
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
          <div className="w-px h-4 bg-surface-300" />
          <button
            onClick={reset}
            className="group p-1.5 rounded-lg text-content-tertiary hover:bg-red-50 hover:text-red-600 transition-all duration-300"
            title="إعادة تعيين"
          >
            <X className="size-3.5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </>
      )}
    </div>
  );
}
