import { getDashboardData } from "@/services/adventureworks.service";
import dynamic from "next/dynamic";
import { AWKPICards } from "./_components/kpi-cards";
import { TerritoriesTable } from "./_components/territories-table";

// Lazy load heavy chart components for better TBT and performance
const AWTopProducts = dynamic(() => import("./_components/top-products-table").then(mod => mod.AWTopProducts), { ssr: false });
const AWRevenueChart = dynamic(() => import("./_components/revenue-chart").then(mod => mod.AWRevenueChart), { ssr: false });
const AWRegionChart = dynamic(() => import("./_components/region-chart").then(mod => mod.AWRegionChart), { ssr: false });
const AWCustomerChart = dynamic(() => import("./_components/customer-chart").then(mod => mod.AWCustomerChart), { ssr: false });
const AWYearlyStats = dynamic(() => import("./_components/yearly-stats").then(mod => mod.AWYearlyStats), { ssr: false });
const SalesQuarterlyChart = dynamic(() => import("./_components/quarterly-chart").then(mod => mod.SalesQuarterlyChart), { ssr: false });

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
    <div className="space-y-6">
      {/* KPI Cards */}
      <AWKPICards kpis={kpis} yearlyData={yearlyData} territories={territories} />

      {/* Charts Row 1: Main Revenue & Regions */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-8">
          <AWRevenueChart data={revenueData} territories={territories} totalSales={kpis.totalSales} />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <AWRegionChart groups={groups} yearlyData={yearlyData} totalSales={kpis.totalSales} />
        </div>
      </div>

      {/* Charts Row 2: Yearly Stats & Customers */}
      <div className="grid grid-cols-12 gap-4 md:gap-6 items-stretch">
        <div className="col-span-12 xl:col-span-5">
          <AWYearlyStats yearlyData={yearlyData} territories={territories} totalSales={kpis.totalSales} />
        </div>
        <div className="col-span-12 xl:col-span-7">
          <AWCustomerChart 
            incomeData={incomeData} 
            genderData={genderData} 
            yearlyData={yearlyData} 
            territories={territories}
            totalCustomers={kpis.totalCustomers} 
          />
        </div>
      </div>

      {/* Charts Row 3: Quarterly Comparison & Detailed Regions */}
      <div className="grid grid-cols-12 gap-4 md:gap-6 items-stretch">
        <div className="col-span-12 xl:col-span-5">
          <SalesQuarterlyChart data={quarterlyData} territories={territories} totalSales={kpis.totalSales} />
        </div>
        <div className="col-span-12 xl:col-span-7">
          <TerritoriesTable territories={territories} />
        </div>
      </div>

      {/* Row 4: Top Products Table */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <AWTopProducts 
            products={topProducts} 
            yearlyData={yearlyData} 
            territories={territories} 
            totalSales={kpis.totalSales} 
          />
        </div>
      </div>
    </div>
  );
}
