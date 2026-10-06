"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import {
  createTaskStore,
  TASK_STORAGE_KEY,
} from "@/features/tasks/store/task-store";
import type { Task } from "@/features/tasks/types/task";

export function useTaskStore(initialTasks: Task[]) {
  const [store] = useState(() =>
    createTaskStore(initialTasks, () => window.localStorage),
  );
  const subscribe = useCallback(
    (listener: () => void) => {
      const unsubscribe = store.subscribe(listener);
      const onStorage = (event: StorageEvent) => {
        if (event.key === TASK_STORAGE_KEY || event.key === null) store.load();
      };
      window.addEventListener("storage", onStorage);
      store.load();
      return () => {
        unsubscribe();
        window.removeEventListener("storage", onStorage);
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
    createTask: store.createTask,
    updateTask: store.updateTask,
    createEpic: store.createEpic,
    addSubtask: store.addSubtask,
    setSubtaskCompleted: store.setSubtaskCompleted,
    reload: store.load,
  };
}
