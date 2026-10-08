import type { Metadata } from "next";
import { PageHeading } from "@/shared/ui/page-heading";
import { WorkspaceSettings } from "@/features/settings/components/workspace-settings";
export const metadata: Metadata = { title: "Workspace settings | Orbit" };
export default function Page() {
  return (
    <div className="max-w-4xl">
      <PageHeading
        title="Workspace settings"
        description="Make Orbit your own. Manage your project, local team names and backups."
      />
      <WorkspaceSettings />
    </div>
  );
}
