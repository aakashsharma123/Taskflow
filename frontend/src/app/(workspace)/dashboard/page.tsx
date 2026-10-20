import type { Metadata } from "next";
import { ProjectDashboard } from "@/features/dashboard/components/project-dashboard";
import { PageHeader } from "@/shared/components/page-header";
export const metadata: Metadata = { title: "Dashboard | Orbit" };
export default function DashboardPage() {
  return (
    <div>
      <PageHeader title="Dashboard" />
      <ProjectDashboard />
    </div>
  );
}
