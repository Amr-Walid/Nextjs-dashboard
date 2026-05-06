import type { KPIs } from "@/services/adventureworks.service";
import { DollarSign, TrendingUp, Package, Percent } from "lucide-react";

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

type Card = {
  title: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  gradient: string;
  accent: string;
  hoverGlow: string;
  iconBg: string;
};

export function AWKPICards({ kpis }: { kpis: KPIs }) {
  const cards: Card[] = [
    {
      title: "إجمالي الإيرادات",
      value: fmt(kpis.totalSales),
      sub: `متوسط الطلب ${fmt(kpis.avgOrderValue)}`,
      icon: <DollarSign size={20} />,
      gradient: "from-neon-crimson to-rose-500",
      accent: "bg-gradient-to-r from-neon-crimson to-transparent",
      hoverGlow: "hover:shadow-glow-crimson hover:border-neon-crimson/50",
      iconBg: "bg-surface-300 text-neon-crimson shadow-glow-crimson",
    },
    {
      title: "إجمالي الأرباح",
      value: fmt(kpis.totalProfit),
      sub: `هامش الربح ${kpis.profitMargin.toFixed(1)}%`,
      icon: <TrendingUp size={20} />,
      gradient: "from-neon-blue to-sky-500",
      accent: "bg-gradient-to-r from-neon-blue to-transparent",
      hoverGlow: "hover:shadow-glow-blue hover:border-neon-blue/50",
      iconBg: "bg-surface-300 text-neon-blue shadow-glow-blue",
    },
    {
      title: "إجمالي الطلبات",
      value: fmtNum(kpis.totalOrders),
      sub: `${fmtNum(kpis.totalQty)} وحدة مباعة`,
      icon: <Package size={20} />,
      gradient: "from-neon-amber to-orange-500",
      accent: "bg-gradient-to-r from-neon-amber to-transparent",
      hoverGlow: "hover:shadow-glow-amber hover:border-neon-amber/50",
      iconBg: "bg-surface-300 text-neon-amber shadow-glow-amber",
    },
    {
      title: "هامش الربح",
      value: `${kpis.profitMargin.toFixed(1)}%`,
      sub: `إجمالي ${fmtNum(kpis.totalCustomers)} عميل`,
      icon: <Percent size={20} />,
      gradient: "from-neon-amber to-neon-crimson",
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
          className={`animate-fade-up delay-${i === 0 ? 0 : i * 75} group relative overflow-hidden rounded-2xl border border-surface-300 bg-surface-200 p-5 shadow-card transition-all duration-300 hover:-translate-y-1 ${c.hoverGlow}`}
        >
          {/* Top accent bar */}
          <div className={`absolute inset-x-0 top-0 h-0.5 ${c.accent} opacity-80`} />

          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="mb-1 text-xs font-medium text-content-secondary truncate">
                {c.title}
              </p>
              <p className="text-2xl font-bold tracking-tight text-content">
                {c.value}
              </p>
              <p className="mt-1.5 text-[11px] text-content-tertiary truncate">
                {c.sub}
              </p>
            </div>

            {/* Icon badge */}
            <div className={`ml-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${c.iconBg} transition-transform duration-300 group-hover:scale-110`}>
              {c.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
