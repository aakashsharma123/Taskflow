import { TaskActionsProvider } from "@/features/tasks/components/task-actions-provider";
import { WorkspaceProvider } from "@/features/workspace/components/workspace-provider";
import type { ReactNode } from "react";
import { WorkspaceShell } from "@/shared/components/workspace-shell";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <WorkspaceProvider>
      <TaskActionsProvider>
        <WorkspaceShell>{children}</WorkspaceShell>
      </TaskActionsProvider>
    </WorkspaceProvider>
  );
}
