import type { Metadata } from "next";
import { PageHeading } from "@/shared/ui/page-heading";
import { SprintPlanner } from "@/features/sprints/components/sprint-planner";
export const metadata: Metadata = { title: "Sprints | Orbit" };
export default function Page() {
  return (
    <div>
      <PageHeading
        title="Sprints"
        description="Turn a backlog of possibilities into a focused plan."
      />
      <SprintPlanner />
    </div>
  );
}
