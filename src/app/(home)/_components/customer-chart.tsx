"use client";
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
import { Users, BarChart3 } from "lucide-react";

type DistItem = { label: string; count: number };

export function AWCustomerChart({
  incomeData,
  genderData,
}: {
  incomeData: DistItem[];
  genderData: DistItem[];
}) {
  const genderTotal = genderData.reduce((s, d) => s + d.count, 0);

  const formattedIncomeData = incomeData.map((d) => ({
    label: d.label
      .replace("70k - 100k", "70 ألف - 100 ألف")
      .replace("40k - 70k", "40 ألف - 70 ألف")
      .replace("أكثر من 100k", "أكثر من 100 ألف")
      .replace("أقل من 40k", "أقل من 40 ألف"),
    count: d.count,
  }));

  return (
    <div className="flex flex-col gap-4 md:gap-6 h-full">
      {/* Income Distribution - Top */}
      <div className="flex-1">
        <div className="card-futuristic p-5 h-full flex flex-col">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-300 text-neon-blue shadow-glow-blue">
              <BarChart3 size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-content">توزيع العملاء حسب الدخل</h3>
              <p className="text-xs font-medium text-neon-blue">فئات الدخل السنوي</p>
            </div>
          </div>

          <div className="h-[200px] w-full mt-auto" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedIncomeData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" opacity={0.5} />
                <XAxis 
                  type="number"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "var(--text-secondary)", fontSize: 10 }}
                />
                <YAxis 
                  dataKey="label"
                  type="category"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "var(--text-secondary)", fontSize: 10 }}
                  width={100}
                />
                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={{ fill: 'var(--surface-300)', opacity: 0.4 }}
                />
                <Bar 
                  dataKey="count" 
                  name="العدد"
                  radius={[0, 4, 4, 0]} 
                  barSize={15}
                  isAnimationActive={false}
                >
                  {formattedIncomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--chart-pink)' : 'var(--chart-blue)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Gender Distribution - Bottom (Horizontal Layout) */}
      <div className="flex-1">
        <div className="card-futuristic p-5 h-full flex flex-col">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-300 text-neon-pink shadow-glow-pink">
              <Users size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-content">توزيع العملاء حسب النوع</h3>
              <p className="text-xs font-medium text-neon-pink">مقارنة بين الجنسين</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-around gap-6 mt-auto">
            <div className="relative flex justify-center items-center h-[160px] w-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData.map(g => ({ name: g.label, value: g.count }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                    isAnimationActive={false}
                  >
                    <Cell fill="var(--chart-pink)" />
                    <Cell fill="var(--chart-blue)" />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Centered Total */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-content-tertiary uppercase tracking-wider">الإجمالي</span>
                <span className="text-base font-bold text-content">
                  {(genderTotal / 1000).toFixed(1)}K
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4 min-w-[150px]">
              {genderData.map((g, i) => (
                <div key={g.label} className="bg-surface-300/30 rounded-xl p-3 border border-surface-300/50 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${i === 0 ? 'bg-neon-pink' : 'bg-neon-blue'} ${i === 0 ? 'shadow-glow-pink' : 'shadow-glow-blue'}`} />
                    <span className="text-xs font-medium text-content-secondary">{g.label}</span>
                  </div>
                  <div className="text-base font-bold text-content">
                    {((g.count / genderTotal) * 100).toFixed(1)}%
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
