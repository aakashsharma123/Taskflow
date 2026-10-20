"use client";
import { useTaskStore } from "@/features/tasks/hooks/use-task-store";
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
  } = useTaskStore();
  if (!ready)
    return (
      <p role="status" className="text-sm">
        Loading workspace settings…
      </p>
    );
  return (
    <div className="grid max-w-6xl items-start gap-6 xl:grid-cols-[1fr_1.15fr]">
      {error && (
        <div
          role="alert"
          className="xl:col-span-2 rounded-xl bg-danger-subtle p-4 text-xs leading-6 text-danger-text"
        >
          {error}
          <button
            type="button"
            className="ui-button ui-button-subtle ui-button-compact ml-2"
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
      <p className="text-[11px] leading-6 text-subtlest xl:col-span-2">
        Saved in this browser. Team names are used for assignments; they do not
        create accounts or send invitations.
      </p>
    </div>
  );
}
