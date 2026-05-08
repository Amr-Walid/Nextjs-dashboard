import dayjs from "dayjs";
import awData from "../data/adventureworks.json";

export type KPIs = {
  totalSales: number;
  totalOrders: number;
  totalQty: number;
  totalCustomers: number;
  totalProducts: number;
  avgOrderValue: number;
  totalProfit: number;
  profitMargin: number;
};

export type MonthlyData = {
  month: string;
  sales: number;
  profit: number;
  orders: number;
  qty: number;
};

export type QuarterlyData = {
  quarter: string;
  sales: number;
  profit: number;
  orders: number;
};

export type YearlyData = {
  year: string;
  sales: number;
  profit: number;
  orders: number;
  qty: number;
  customers: number;
};

export type ProductData = {
  name: string;
  listPrice: number;
  sales: number;
  profit: number;
  profitMargin: number;
  qty: number;
  orders: number;
};

export type TerritoryData = {
  key: number;
  region: string;
  country: string;
  group: string;
  sales: number;
  profit: number;
  orders: number;
};

export type GroupData = {
  group: string;
  sales: number;
  profit: number;
  orders: number;
};

// ── Dashboard Data ────────────────────────────────────
export function getDashboardData() {
  const monthly = awData.monthly as MonthlyData[];
  
  return {
    kpis: awData.kpis as KPIs,
    revenueChart: {
      sales: monthly.map((m) => ({ x: dayjs(m.month).format("MMM YYYY"), y: Math.round(m.sales) })),
      profit: monthly.map((m) => ({ x: dayjs(m.month).format("MMM YYYY"), y: Math.round(m.profit) })),
    },
    groups: awData.groups as GroupData[],
    topProducts: (awData.topProducts as ProductData[]).slice(0, 50),
    incomeData: awData.customerIncome,
    genderData: awData.customerGender,
    yearlyData: awData.yearly as YearlyData[],
    quarterlyData: awData.quarterly as QuarterlyData[],
    territories: awData.territories as TerritoryData[],
  };
}

export type DashboardData = ReturnType<typeof getDashboardData>;

// ── Individual getters (keeping for compatibility if needed) ──
export const getKPIs = () => awData.kpis as KPIs;
export const getMonthlyData = () => awData.monthly as MonthlyData[];
export const getYearlyData = () => awData.yearly as YearlyData[];
export const getQuarterlyData = () => awData.quarterly as QuarterlyData[];
export const getTopProducts = (limit = 10) => (awData.topProducts as ProductData[]).slice(0, limit);
export const getTerritoryData = () => awData.territories as TerritoryData[];
export const getGroupData = () => awData.groups as GroupData[];
export const getCustomerIncomeDistribution = () => awData.customerIncome;
export const getCustomerGenderDistribution = () => awData.customerGender;

export function getRevenueChartData() {
  const monthly = awData.monthly as MonthlyData[];
  const last24 = monthly.slice(-24);
  return {
    sales: last24.map((m) => ({
      x: m.month,
      y: Math.round(m.sales),
    })),
    profit: last24.map((m) => ({
      x: m.month,
      y: Math.round(m.profit),
    })),
  };
}

// ── Yearly chart for overview ─────────────────────────
export function getYearlySalesChart() {
  const yearly = awData.yearly as YearlyData[];
  return {
    sales: yearly.map((y) => ({ x: y.year, y: Math.round(y.sales) })),
    profit: yearly.map((y) => ({ x: y.year, y: Math.round(y.profit) })),
    orders: yearly.map((y) => ({ x: y.year, y: y.orders })),
  };
}
