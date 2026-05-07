"use client";
import { useMemo } from "react";
import type { TerritoryData } from "@/services/adventureworks.service";
import { useFilters } from "@/context/FilterContext";
import { cn } from "@/lib/utils";

const GROUP_LABELS: Record<string, string> = {
  "North America": "أمريكا الشمالية",
  Europe: "أوروبا",
  Pacific: "المحيط الهادئ",
  NA: "غير محدد",
};

const GROUP_COLORS: Record<string, string> = {
  "North America":
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Europe:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  Pacific:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export function TerritoriesTable({
  territories,
}: {
  territories: TerritoryData[];
}) {
  const { filters } = useFilters();

  const filteredTerritories = useMemo(() => {
    let result = territories.filter((t) => t.group !== "NA");
    if (filters.region !== "All") {
      result = result.filter(t => t.group === filters.region);
    }
    return result;
  }, [territories, filters.region]);

  const totalSales = filteredTerritories.reduce((s, t) => s + t.sales, 0);

  return (
    <div className="card-futuristic p-6 h-full transition-all duration-500">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-content">تفصيل المناطق</h3>
          <p className="text-sm font-medium text-neon-pink">المبيعات حسب المنطقة الجغرافية</p>
        </div>
        {filters.region !== "All" && (
          <span className="text-[10px] px-2 py-1 rounded-lg bg-neon-blue text-white shadow-glow-blue font-bold">
            فلتر: {filters.region}
          </span>
        )}
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-300">
              {["المنطقة", "الدولة", "المجموعة", "الإيرادات", "الطلبات", "النسبة"].map((h) => (
                <th
                  key={h}
                  className="pb-4 text-right font-bold text-content-tertiary text-xs uppercase tracking-widest"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-300/50">
            {filteredTerritories.map((t) => {
              const pct = totalSales > 0 ? ((t.sales / totalSales) * 100).toFixed(1) : "0.0";
              return (
                <tr
                  key={t.key}
                  className="transition-colors hover:bg-surface-300/20 group animate-fade-up"
                >
                  <td className="py-4 pr-2 font-bold text-content group-hover:text-neon-pink transition-colors">
                    {t.region}
                  </td>
                  <td className="py-4 pr-2 text-content-secondary font-medium">
                    {t.country}
                  </td>
                  <td className="py-4 pr-2">
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-tighter",
                        GROUP_COLORS[t.group] || "bg-surface-300 text-content-tertiary"
                      )}
                    >
                      {GROUP_LABELS[t.group] ?? t.group}
                    </span>
                  </td>
                  <td className="py-4 pr-2 font-black text-neon-blue">
                    ${(t.sales / 1_000_000).toFixed(2)}M
                  </td>
                  <td className="py-4 pr-2 text-content-secondary font-medium">
                    {t.orders.toLocaleString()}
                  </td>
                  <td className="py-4 pr-2">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 rounded-full bg-surface-300 h-1.5 min-w-[60px] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-neon-pink shadow-glow-pink transition-all duration-1000"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-content-tertiary min-w-[35px]">{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

