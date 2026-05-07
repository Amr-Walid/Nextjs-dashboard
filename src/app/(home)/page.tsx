import { getDashboardData } from "@/services/adventureworks.service";
import { DashboardContent } from "./_components/dashboard-content";

export default async function Home() {
  const data = getDashboardData();

  return <DashboardContent data={data} />;
}
