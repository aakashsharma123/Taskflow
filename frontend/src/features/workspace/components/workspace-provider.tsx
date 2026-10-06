"use client";

import {
  useCallback,
  useState,
  useSyncExternalStore,
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import {
  createTaskStore,
  TASK_STORAGE_KEY,
} from "@/features/tasks/store/task-store";
import { sampleTasks } from "@/features/tasks/data/sample-tasks";
import { workspaceAppearances } from "@/features/settings/constants/workspace-appearances";

function useWorkspaceStore() {
  const [store] = useState(() =>
    createTaskStore(sampleTasks, () => window.localStorage),
  );
  const subscribe = useCallback(
    (listener: () => void) => {
      const unsubscribe = store.subscribe(listener);
      const onStorage = (event: StorageEvent) => {
        if (event.key === TASK_STORAGE_KEY || event.key === null) store.load();
      };
      window.addEventListener("storage", onStorage);
      window.addEventListener("focus", store.load);
      store.load();
      return () => {
        unsubscribe();
        window.removeEventListener("storage", onStorage);
        window.removeEventListener("focus", store.load);
      };
    },
    [store],
  );
  const snapshot = useSyncExternalStore(
    subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  return {
    ...snapshot,
    selectMember: store.selectMember,
    updateSettings: store.updateSettings,
    addMember: store.addMember,
    removeMember: store.removeMember,
    createSprint: store.createSprint,
    assignSprint: store.assignSprint,
    startSprint: store.startSprint,
    completeSprint: store.completeSprint,
    createTask: store.createTask,
    moveTask: store.moveTask,
    setPlacement: store.setPlacement,
    setArchived: store.setArchived,
    deleteTask: store.deleteTask,
    restoreDeletedTask: store.restoreDeletedTask,
    updateTask: store.updateTask,
    createEpic: store.createEpic,
    addSubtask: store.addSubtask,
    setSubtaskCompleted: store.setSubtaskCompleted,
    reload: store.load,
  };
}

const WorkspaceContext = createContext<ReturnType<
  typeof useWorkspaceStore
> | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const workspace = useWorkspaceStore();
  const appearance = workspaceAppearances[workspace.settings.appearance];
  useEffect(() => {
    if (!workspace.ready || workspace.error) return;
    document.documentElement.style.setProperty(
      "--color-secondary",
      appearance.accent,
    );
    document.documentElement.style.setProperty(
      "--color-workspace",
      appearance.background,
    );
  }, [workspace.ready, workspace.error, appearance]);
  return (
    <WorkspaceContext.Provider value={workspace}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context)
    throw new Error("Workspace components require WorkspaceProvider.");
  return context;
}
