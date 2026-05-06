import { getDashboardData } from "@/services/adventureworks.service";
import { AWKPICards } from "./_components/kpi-cards";
import { AWTopProducts } from "./_components/top-products-table";
import { TerritoriesTable } from "./_components/territories-table";
import { AWRevenueChart } from "./_components/revenue-chart";
import { AWRegionChart } from "./_components/region-chart";
import { AWCustomerChart } from "./_components/customer-chart";
import { AWYearlyStats } from "./_components/yearly-stats";
import { SalesQuarterlyChart } from "./_components/quarterly-chart";
export default async function Home() {
  const {
    kpis,
    revenueChart: revenueData,
    groups,
    topProducts,
    incomeData,
    genderData,
    yearlyData,
    quarterlyData,
    territories,
  } = getDashboardData();

  return (
    <div className="space-y-6 pt-2">
      {/* KPI Cards */}
      <AWKPICards kpis={kpis} />

      {/* Charts Row 1: Main Revenue & Regions */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-8">
          <AWRevenueChart data={revenueData} />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <AWRegionChart groups={groups} />
        </div>
      </div>

      {/* Charts Row 2: Yearly Stats & Customers */}
      <div className="grid grid-cols-12 gap-4 md:gap-6 items-stretch">
        <div className="col-span-12 xl:col-span-5">
          <AWYearlyStats yearlyData={yearlyData} />
        </div>
        <div className="col-span-12 xl:col-span-7">
          <AWCustomerChart incomeData={incomeData} genderData={genderData} />
        </div>
      </div>

      {/* Charts Row 3: Quarterly Comparison & Detailed Regions */}
      <div className="grid grid-cols-12 gap-4 md:gap-6 items-stretch">
        <div className="col-span-12 xl:col-span-5">
          <SalesQuarterlyChart data={quarterlyData} />
        </div>
        <div className="col-span-12 xl:col-span-7">
          <TerritoriesTable territories={territories} />
        </div>
      </div>

      {/* Row 4: Top Products Table */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <AWTopProducts products={topProducts} />
        </div>
      </div>
    </div>
  );
}
