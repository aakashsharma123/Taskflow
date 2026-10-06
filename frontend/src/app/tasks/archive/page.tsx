import type { Metadata } from "next";
import { TaskBoard } from "@/features/tasks/components/task-board";
import { sampleTasks } from "@/features/tasks/data/sample-tasks";
export const metadata: Metadata = { title: "Archive | Orbit" };
export default function ArchivePage() {
  return (
    <div>
      <p className="mb-2 text-xs text-base-content/60">Projects / Orbit</p>
      <h1 className="text-3xl font-semibold tracking-tight">Archive</h1>
      <p className="mt-2 mb-8 text-xs leading-6 text-base-content/65">
        Keep finished work out of the way. Restore it whenever you need.
      </p>
      <TaskBoard tasks={sampleTasks} mode="archive" />
    </div>
  );
}
