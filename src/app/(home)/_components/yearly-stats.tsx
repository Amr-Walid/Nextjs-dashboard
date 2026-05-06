"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { YearlyData } from "@/services/adventureworks.service";
import { CustomTooltip } from "@/components/ui/chart-tooltip";

export function AWYearlyStats({ yearlyData }: { yearlyData: YearlyData[] }) {
  return (
    <div className="card-futuristic p-5 h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center gap-4">
        <div>
          <h3 className="text-base font-bold text-content mb-1">
            المقارنة السنوية
          </h3>
          <p className="text-xs font-medium text-neon-pink">
            الإيرادات والأرباح سنة بسنة
          </p>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {yearlyData.map((y, index) => (
          <div
            key={y.year}
            className="rounded-xl bg-surface-200 border border-surface-300 p-3 text-center transition-all duration-300 hover:shadow-glow-pink/20 hover:-translate-y-1"
          >
            <p className="text-xs font-medium text-content-tertiary mb-1">{y.year}</p>
            <p className="font-bold text-content text-base">
              ${(y.sales / 1_000_000).toFixed(1)}M
            </p>
            <p className="text-xs font-medium text-neon-blue mt-0.5">
              ربح: ${(y.profit / 1_000_000).toFixed(1)}M
            </p>
            <p className="text-[11px] text-content-secondary mt-1">{y.orders.toLocaleString()} طلب</p>
          </div>
        ))}
      </div>

      <div className="h-[250px] w-full mt-auto" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={yearlyData}
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" opacity={0.5} />
            <XAxis 
              dataKey="year" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              dy={10}
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`}
            />
            <Tooltip 
              content={<CustomTooltip formatter={(val: any) => `$${val?.toLocaleString() ?? ""}`} />} 
              cursor={{ fill: 'var(--border-default)', opacity: 0.2 }}
            />
            <Bar 
              dataKey="sales" 
              name="الإيرادات" 
              fill="var(--chart-pink)" 
              radius={[4, 4, 0, 0]}
              barSize={12}
              isAnimationActive={false}
            />
            <Bar 
              dataKey="profit" 
              name="الأرباح" 
              fill="var(--chart-blue)" 
              radius={[4, 4, 0, 0]}
              barSize={12}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Row */}
      <div className="mt-6 flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-neon-pink shadow-glow-pink" />
          <span className="text-xs font-bold text-content">الإيرادات</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-neon-blue shadow-glow-blue" />
          <span className="text-xs font-bold text-content">الأرباح</span>
        </div>
      </div>
    </div>
  );
}
