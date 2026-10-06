import { ProjectBreadcrumb } from "@/features/settings/components/project-identity";
import type { Metadata } from "next";
import { TaskWorkspace } from "@/features/tasks/components/task-workspace";

export const metadata: Metadata = { title: "Board | Orbit" };

export default function TasksPage() {
  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <ProjectBreadcrumb />
          <h1 className="text-3xl font-semibold tracking-tight">Board</h1>
          <p className="mt-2 text-xs leading-6 text-base-content/65">
            A shared view of what’s next, what’s moving, and what’s done.
          </p>
        </div>
        <span className="badge badge-outline mt-1 rounded-md border-base-300 px-3 py-3 text-[11px] text-base-content/65">
          Local workspace
        </span>
      </div>
      <TaskWorkspace />
    </div>
  );
}
