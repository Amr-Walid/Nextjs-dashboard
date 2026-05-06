"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CustomTooltip } from "@/components/ui/chart-tooltip";

type RevenueData = {
  sales: { x: string; y: number }[];
  profit: { x: string; y: number }[];
};

export function AWRevenueChart({ data }: { data: RevenueData }) {
  // Data is now pre-formatted from the server
  const chartData = data.sales.map((item, index) => ({
    name: item.x,
    sales: item.y,
    profit: data.profit[index]?.y || 0,
  }));

  return (
    <div className="card-futuristic p-5 h-full">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-content tracking-wide">
            اتجاه الإيرادات والأرباح
          </h3>
          <p className="text-xs font-medium text-neon-pink">
            آخر 24 شهر • AdventureWorks
          </p>
        </div>
        <div className="flex gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-200 px-3 py-1 text-xs font-medium text-neon-pink shadow-glow-pink">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-pink" />
            إيرادات
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-200 px-3 py-1 text-xs font-medium text-neon-blue shadow-glow-blue">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-blue" />
            أرباح
          </span>
        </div>
      </div>
      
      <div className="h-[250px] sm:h-[310px] w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-pink)" stopOpacity={0.5} />
                <stop offset="95%" stopColor="var(--chart-pink)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-blue)" stopOpacity={0.5} />
                <stop offset="95%" stopColor="var(--chart-blue)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" opacity={0.5} />
            <XAxis 
              dataKey="name" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              dy={10}
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              width={60}
              tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip 
              content={<CustomTooltip formatter={(val: any) => `$${val?.toLocaleString() ?? ""}`} />} 
              cursor={{ stroke: 'var(--border-default)', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <Area
              type="monotone"
              dataKey="sales"
              name="الإيرادات"
              stroke="var(--chart-pink)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSales)"
              isAnimationActive={false}
              activeDot={{ r: 6, fill: "var(--chart-pink)", strokeWidth: 0, style: { filter: "drop-shadow(0 0 8px var(--chart-pink))" } }}
            />
            <Area
              type="monotone"
              dataKey="profit"
              name="الأرباح"
              stroke="var(--chart-blue)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorProfit)"
              isAnimationActive={false}
              activeDot={{ r: 6, fill: "var(--chart-blue)", strokeWidth: 0, style: { filter: "drop-shadow(0 0 8px var(--chart-blue))" } }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
