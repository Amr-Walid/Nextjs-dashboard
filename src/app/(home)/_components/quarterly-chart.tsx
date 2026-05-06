"use client";
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
import type { QuarterlyData } from "@/services/adventureworks.service";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-surface-300 bg-surface-base/90 p-4 shadow-xl backdrop-blur-md">
        <p className="mb-2 font-black text-content">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-3">
              <div 
                className="h-2 w-2 rounded-full" 
                style={{ backgroundColor: entry.color }} 
              />
              <span className="text-xs font-bold text-content-secondary">{entry.name}:</span>
              <span className="text-xs font-black text-content">
                ${(entry.value / 1_000_000).toFixed(1)}M
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function SalesQuarterlyChart({ data }: { data: QuarterlyData[] }) {
  return (
    <div className="card-futuristic p-5 h-full">
      <div className="mb-4">
        <h3 className="text-xl font-black text-content">المقارنة الربع سنوية</h3>
        <p className="text-sm font-medium text-neon-pink">إيرادات وأرباح كل ربع سنة</p>
      </div>

      <div className="h-[350px] sm:h-[600px] w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            layout="vertical"
            margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
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
              width={70}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--border-default)', opacity: 0.1 }} />
            <Legend 
              verticalAlign="top" 
              align="center" 
              iconType="circle" 
              iconSize={8}
              wrapperStyle={{ paddingTop: "0px", paddingBottom: "30px", fontSize: "12px", fontWeight: "bold" }}
            />
            <Bar 
              name="الإيرادات"
              dataKey="sales" 
              fill="var(--chart-pink)" 
              radius={[0, 4, 4, 0]}
              barSize={12}
              isAnimationActive={false}
            />
            <Bar 
              name="الأرباح"
              dataKey="profit" 
              fill="var(--chart-blue)" 
              radius={[0, 4, 4, 0]}
              barSize={12}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
