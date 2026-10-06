import { z } from "zod";
import type { Task } from "@/features/tasks/types/task";
import type { CreateTaskInput } from "@/features/tasks/schemas/create-task-schema";

export const TASK_STORAGE_KEY = "orbit.workspace.v1";

const savedTaskSchema: z.ZodType<Task> = z.object({
  id: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  title: z.string().trim().min(1).max(120),
  status: z.enum(["todo", "in_progress", "in_review", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  epic: z.string().min(1).nullable(),
  assignee: z.string().min(1).nullable(),
});

const workspaceSchema = z.object({
  version: z.literal(1),
  tasks: z
    .array(savedTaskSchema)
    .refine(
      (tasks) => new Set(tasks.map((task) => task.id)).size === tasks.length,
    ),
});

type Snapshot = { tasks: Task[]; ready: boolean; error: string | null };
export type SaveResult = { ok: true } | { ok: false; error: string };
type StorageClient = Pick<Storage, "getItem" | "setItem">;

export function createTaskStore(seed: Task[], getStorage: () => StorageClient) {
  const serverSnapshot: Snapshot = { tasks: seed, ready: false, error: null };
  let snapshot = serverSnapshot;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());

  function load() {
    try {
      const raw = getStorage().getItem(TASK_STORAGE_KEY);
      const saved =
        raw === null ? null : workspaceSchema.parse(JSON.parse(raw));
      snapshot = { tasks: saved?.tasks ?? seed, ready: true, error: null };
    } catch {
      snapshot = {
        ...snapshot,
        ready: true,
        error:
          "Your saved workspace could not be loaded. Changes are paused to protect your data. Check browser storage and try again.",
      };
    }
    emit();
  }

  function save(tasks: Task[]): SaveResult {
    try {
      getStorage().setItem(
        TASK_STORAGE_KEY,
        JSON.stringify({ version: 1, tasks }),
      );
      snapshot = { tasks, ready: true, error: null };
      emit();
      return { ok: true };
    } catch {
      return {
        ok: false,
        error:
          "Your changes could not be saved. Browser storage may be full or unavailable. Your form is still here; try again.",
      };
    }
  }

  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => serverSnapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    load,
    createTask(input: CreateTaskInput): SaveResult {
      if (!snapshot.ready)
        return {
          ok: false,
          error: "Your workspace is still loading. Try again in a moment.",
        };
      load(); // Read the latest saved state before assigning an ID.
      if (snapshot.error) return { ok: false, error: snapshot.error };
      const id =
        snapshot.tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;
      if (!Number.isSafeInteger(id))
        return { ok: false, error: "A new task ID could not be assigned." };
      return save([{ ...input, id }, ...snapshot.tasks]);
    },
  };
}
