import type { Metadata } from "next";
import { PageHeading } from "@/shared/ui/page-heading";
import { TaskWorkspace } from "@/features/tasks/components/task-workspace";
export const metadata: Metadata = { title: "Board | Orbit" };
export default function Page() {
  return (
    <div>
      <PageHeading
        title="Board"
        description="See what’s next, what’s moving and what’s done."
      />
      <TaskWorkspace />
    </div>
  );
}
