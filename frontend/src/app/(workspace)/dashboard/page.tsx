import type { Metadata } from "next";
import { PageHeading } from "@/shared/ui/page-heading";
import { ProjectDashboard } from "@/features/dashboard/components/project-dashboard";
export const metadata: Metadata = { title: "Dashboard | Orbit" };
export default function Page() {
  return (
    <div>
      <PageHeading
        title="Dashboard"
        description="Progress, priorities and the bigger picture."
      />
      <ProjectDashboard />
    </div>
  );
}
