"use client";
import { useWorkspace } from "@/features/workspace/components/workspace-provider";
import { WorkspaceState } from "@/features/workspace/components/workspace-state";
import { EpicsDialog } from "./epics-dialog";
import { EpicCollection } from "./epic-collection";
export function EpicWorkspace() {
  const { tasks, epics, createEpic } = useWorkspace();
  return (
    <WorkspaceState>
      <div className="mb-5 flex justify-end">
        <EpicsDialog
          epics={epics}
          tasks={tasks}
          onCreate={createEpic}
          triggerLabel="New epic"
        />
      </div>
      <EpicCollection epics={epics} tasks={tasks} expanded />
    </WorkspaceState>
  );
}
