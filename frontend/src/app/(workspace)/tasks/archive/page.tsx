import { ProjectBreadcrumb } from "@/features/settings/components/project-identity";
import type { Metadata } from "next";
import { TaskWorkspace } from "@/features/tasks/components/task-workspace";
export const metadata: Metadata = { title: "Archive | Orbit" };
export default function ArchivePage() {
  return (
    <div>
      <ProjectBreadcrumb />
      <h1 className="text-3xl font-semibold tracking-tight">Archive</h1>
      <p className="mt-2 mb-8 text-xs leading-6 text-base-content/65">
        Keep finished work out of the way. Restore it whenever you need.
      </p>
      <TaskWorkspace mode="archive" />
    </div>
  );
}
