import type { Metadata } from "next";
import { TaskWorkspace } from "@/features/tasks/components/task-workspace";
import { PageHeader } from "@/shared/components/page-header";

export const metadata: Metadata = { title: "Board | Orbit" };

export default function TasksPage() {
  return (
    <div>
      <PageHeader title="Board" />
      <TaskWorkspace />
    </div>
  );
}
