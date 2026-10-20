import { ProjectBreadcrumb } from "@/features/settings/components/project-identity";
import type { Metadata } from "next";
import { SprintPlanner } from "@/features/sprints/components/sprint-planner";
export const metadata: Metadata = { title: "Sprints | Orbit" };
export default function SprintsPage() {
  return (
    <div>
      <ProjectBreadcrumb />
      <h1 className="text-3xl font-semibold tracking-tight">Sprints</h1>
      <p className="mt-2 mb-8 text-xs leading-6 text-base-content/65">
        Turn a backlog of possibilities into a focused plan.
      </p>
      <SprintPlanner />
    </div>
  );
}
