import type { Metadata } from "next";
import { TaskWorkspace } from "@/features/tasks/components/task-workspace";
import { PageHeader } from "@/shared/components/page-header";
export const metadata: Metadata = { title: "Backlog | Orbit" };
export default function BacklogPage() {
  return (
    <div>
      <PageHeader title="Backlog" />
      <TaskWorkspace mode="backlog" />
    </div>
  );
}
