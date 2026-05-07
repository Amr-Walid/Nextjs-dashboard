"use client";
import React from "react";
import { Globe, Calendar, ChevronDown } from "lucide-react";
import { Dropdown, DropdownContent, DropdownTrigger } from "./dropdown";
import { cn } from "@/lib/utils";

const REGION_LABELS: Record<string, string> = {
  "All": "كل المناطق",
  "North America": "أمريكا الشمالية",
  "Europe": "أوروبا",
  "Pacific": "المحيط الهادي"
};

type LocalFilterDropdownProps = {
  type: "year" | "region";
  value: string;
  options: string[];
  openKey: string;
  openDropdown: string | null;
  setOpen: (key: string | null) => void;
  onChange: (val: string) => void;
};

export function LocalFilterDropdown({ 
  type, 
  value, 
  options, 
  openKey, 
  openDropdown, 
  setOpen, 
  onChange 
}: LocalFilterDropdownProps) {
  const isYear = type === "year";
  const Icon = isYear ? Calendar : Globe;
  
  return (
    <Dropdown isOpen={openDropdown === openKey} setIsOpen={(val) => setOpen(val ? openKey : null)}>
      <DropdownTrigger className={cn(
        "group flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all duration-300 text-[10px] font-bold border border-transparent",
        value !== "All" 
          ? "bg-blue-50 text-neon-blue border-blue-200" 
          : "text-content-secondary bg-surface-200 hover:bg-surface-300 hover:text-content border-surface-300"
      )}>
        <Icon className={cn("size-3", value !== "All" ? "text-neon-blue" : "text-content-tertiary")} />
        <span>{value === "All" ? (isYear ? "السنة" : "المنطقة") : (isYear ? value : REGION_LABELS[value])}</span>
        <ChevronDown className={cn("size-2.5 transition-transform", openDropdown === openKey && "rotate-180")} />
      </DropdownTrigger>
      <DropdownContent align="start" className="mt-2 bg-white border border-surface-300 shadow-xl p-1 min-w-[130px] z-[9999] rounded-lg overflow-hidden">
        <div className="px-3 py-1.5 mb-1 text-[9px] font-black text-content-tertiary uppercase tracking-widest border-b border-surface-100">
          اختر {isYear ? "السنة" : "المنطقة"}
        </div>
        {options.map((opt: string) => (
          <button
            key={opt}
            onClick={() => { onChange(opt); setOpen(null); }}
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
}
