import type { Metadata } from "next";
import { WorkspaceSettings } from "@/features/settings/components/workspace-settings";
import { PageHeader } from "@/shared/components/page-header";
export const metadata: Metadata = { title: "Settings | Orbit" };
export default function SettingsPage() {
  return (
    <div className="max-w-4xl">
      <PageHeader title="Workspace settings" />
      <WorkspaceSettings />
    </div>
  );
}
