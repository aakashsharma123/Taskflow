import type { Metadata } from "next";
import { TaskWorkspace } from "@/features/tasks/components/task-workspace";
import { PageHeader } from "@/shared/components/page-header";
export const metadata: Metadata = { title: "Archive | Orbit" };
export default function ArchivePage() {
  return (
    <div>
      <PageHeader
        title="Archive"
        parent={{ href: "/backlog", label: "Backlog" }}
      />
      <TaskWorkspace mode="archive" />
    </div>
  );
}
