import type { Metadata } from "next";
import { ProjectBreadcrumb } from "@/features/settings/components/project-identity";
import { WorkspaceSettings } from "@/features/settings/components/workspace-settings";
export const metadata: Metadata = { title: "Settings | Orbit" };
export default function SettingsPage() {
  return (
    <div className="max-w-4xl">
      <ProjectBreadcrumb />
      <h1 className="text-3xl font-semibold tracking-tight">
        Workspace settings
      </h1>
      <p className="mt-2 mb-8 text-xs leading-6 text-base-content/65">
        Make your project feel like your team’s space.
      </p>
      <WorkspaceSettings />
    </div>
  );
}
