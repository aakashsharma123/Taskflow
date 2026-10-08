import type { Metadata } from "next";
import { PageHeading } from "@/shared/ui/page-heading";
import { TaskWorkspace } from "@/features/tasks/components/task-workspace";
export const metadata: Metadata = { title: "Backlog | Orbit" };
export default function Page() {
  return (
    <div>
      <PageHeading
        title="Backlog"
        description="Capture ideas and parked work. Move a task to Board when it’s ready."
      />
      <TaskWorkspace mode="backlog" />
    </div>
  );
}
