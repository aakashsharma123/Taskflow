import type { Metadata } from "next";
import { TaskWorkspace } from "@/features/tasks/components/task-workspace";
import { sampleTasks } from "@/features/tasks/data/sample-tasks";

export const metadata: Metadata = { title: "Board | Orbit" };

export default function TasksPage() {
  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs text-base-content/60">Projects / Orbit</p>
          <h1 className="text-3xl font-semibold tracking-tight">Board</h1>
          <p className="mt-2 text-xs leading-6 text-base-content/65">
            A shared view of what’s next, what’s moving, and what’s done.
          </p>
        </div>
        <span className="badge badge-outline mt-1 rounded-md border-base-300 px-3 py-3 text-[11px] text-base-content/65">
          Local workspace
        </span>
      </div>
      <TaskWorkspace tasks={sampleTasks} />
    </div>
  );
}
