import type { ReactNode } from "react";
import { WorkspaceShell } from "@/shared/components/workspace-shell";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
