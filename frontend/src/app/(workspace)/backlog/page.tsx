import { ProjectBreadcrumb } from "@/features/settings/components/project-identity";
import type { Metadata } from "next";
import { TaskWorkspace } from "@/features/tasks/components/task-workspace";
export const metadata: Metadata = { title: "Backlog | Orbit" };
export default function BacklogPage() {
  return (
    <div>
      <ProjectBreadcrumb />
      <h1 className="text-3xl font-semibold tracking-tight">Backlog</h1>
      <p className="mt-2 mb-8 text-xs leading-6 text-base-content/65">
        Capture ideas and parked work. Move a task to Board when it’s ready.
      </p>
      <TaskWorkspace mode="backlog" />
    </div>
  );
}
