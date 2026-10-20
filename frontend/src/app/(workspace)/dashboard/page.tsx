import { ProjectBreadcrumb } from "@/features/settings/components/project-identity";
import type { Metadata } from "next";
import { ProjectDashboard } from "@/features/dashboard/components/project-dashboard";
export const metadata: Metadata = { title: "Dashboard | Orbit" };
export default function DashboardPage() {
  return (
    <div>
      <ProjectBreadcrumb />
      <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-2 mb-8 text-xs leading-6 text-base-content/65">
        Progress, priorities, and the bigger picture.
      </p>
      <ProjectDashboard />
    </div>
  );
}
