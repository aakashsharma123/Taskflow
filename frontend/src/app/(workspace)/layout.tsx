import { WorkspaceProvider } from "@/features/workspace/components/workspace-provider";
import type { ReactNode } from "react";
import { WorkspaceShell } from "@/shared/components/workspace-shell";
import { FlagProvider } from "@/shared/components/flag-provider";
import { MotionProvider } from "@/shared/components/motion-provider";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <MotionProvider>
      <WorkspaceProvider>
        <FlagProvider>
          <WorkspaceShell>{children}</WorkspaceShell>
        </FlagProvider>
      </WorkspaceProvider>
    </MotionProvider>
  );
}
