"use client";
import { useWorkspace } from "@/features/workspace/components/workspace-provider";
import { ProjectSettingsForm } from "./project-settings-form";
import { TeamMembers } from "./team-members";
export function WorkspaceSettings() {
  const {
    ready,
    error,
    settings,
    tasks,
    removedTasks,
    updateSettings,
    addMember,
    removeMember,
    reload,
  } = useWorkspace();
  if (!ready)
    return (
      <p role="status" className="text-sm">
        Loading workspace settings…
      </p>
    );
  return (
    <div className="space-y-6">
      {error && (
        <div
          role="alert"
          className="rounded-xl bg-rose-50 p-4 text-xs leading-6 text-rose-800"
        >
          {error}
          <button
            type="button"
            className="btn btn-ghost btn-sm ml-2"
            onClick={reload}
          >
            Try again
          </button>
        </div>
      )}
      <ProjectSettingsForm
        settings={settings}
        disabled={Boolean(error)}
        onSave={updateSettings}
      />
      <TeamMembers
        members={settings.members}
        tasks={[...tasks, ...removedTasks]}
        disabled={Boolean(error)}
        onAdd={addMember}
        onRemove={removeMember}
      />
      <p className="text-[11px] leading-6 text-base-content/60">
        Saved in this browser. Team names are used for assignments; they do not
        create accounts or send invitations.
      </p>
    </div>
  );
}
