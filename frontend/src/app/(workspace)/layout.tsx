import { WorkspaceProvider } from "@/features/workspace/components/workspace-provider";
import type { ReactNode } from "react";
import { WorkspaceShell } from "@/shared/components/workspace-shell";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <WorkspaceProvider>
      <WorkspaceShell>{children}</WorkspaceShell>
    </WorkspaceProvider>
  );
}
