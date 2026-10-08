import type { Metadata } from "next";
import { PageHeading } from "@/shared/ui/page-heading";
import { TaskWorkspace } from "@/features/tasks/components/task-workspace";
export const metadata: Metadata = { title: "Archive | Orbit" };
export default function Page() {
  return (
    <div>
      <PageHeading
        title="Archive"
        description="Keep finished work out of the way. Restore it whenever you need."
      />
      <TaskWorkspace mode="archive" />
    </div>
  );
}
