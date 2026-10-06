import { z } from "zod";
import type { Task, TaskStatus } from "@/features/tasks/types/task";
import {
  createTaskSchema,
  taskTitleSchema,
  type CreateTaskInput,
} from "@/features/tasks/schemas/create-task-schema";
import { subtaskTitleSchema } from "@/features/tasks/schemas/subtask-schema";
import { createEpicSchema } from "@/features/epics/schemas/create-epic-schema";

export const TASK_STORAGE_KEY = "orbit.workspace.v1";
const idSchema = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
const subtaskSchema = z
  .object({ id: idSchema, title: subtaskTitleSchema, completed: z.boolean() })
  .strict();
const savedTaskSchema: z.ZodType<Task> = z.object({
  id: idSchema,
  title: taskTitleSchema,
  status: z.enum(["todo", "in_progress", "in_review", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  epic: z.string().min(1).max(60).nullable(),
  assignee: z.string().min(1).nullable(),
  subtasks: z
    .array(subtaskSchema)
    .default([])
    .refine(
      (items) => new Set(items.map((item) => item.id)).size === items.length,
    ),
});
const workspaceSchema = z.object({
  version: z.literal(1),
  tasks: z
    .array(savedTaskSchema)
    .refine(
      (tasks) => new Set(tasks.map((task) => task.id)).size === tasks.length,
    ),
  epics: z
    .array(z.string().trim().min(1).max(60))
    .refine(
      (names) =>
        new Set(names.map((name) => name.toLowerCase())).size === names.length,
    )
    .optional(),
});

type Snapshot = {
  tasks: Task[];
  epics: string[];
  ready: boolean;
  error: string | null;
};
export type SaveResult = { ok: true } | { ok: false; error: string };
type StorageClient = Pick<Storage, "getItem" | "setItem">;
const taskEpics = (tasks: Task[]) => [
  ...new Set(tasks.flatMap((task) => (task.epic ? [task.epic] : []))),
];
const nextId = (items: { id: number }[]) =>
  items.reduce((max, item) => Math.max(max, item.id), 0) + 1;

export function createTaskStore(seed: Task[], getStorage: () => StorageClient) {
  const serverSnapshot: Snapshot = {
    tasks: seed,
    epics: taskEpics(seed),
    ready: false,
    error: null,
  };
  let snapshot = serverSnapshot;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());

  function load() {
    try {
      const raw = getStorage().getItem(TASK_STORAGE_KEY);
      const saved =
        raw === null ? null : workspaceSchema.parse(JSON.parse(raw));
      const tasks = saved?.tasks ?? seed;
      const epics = saved?.epics ?? taskEpics(tasks);
      if (
        tasks.some((task) => task.epic !== null && !epics.includes(task.epic))
      )
        throw new Error("Unknown epic reference");
      snapshot = { tasks, epics, ready: true, error: null };
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

  function prepare(): SaveResult | undefined {
    if (!snapshot.ready)
      return {
        ok: false,
        error: "Your workspace is still loading. Try again in a moment.",
      };
    load(); // Include changes saved by another tab before writing.
    if (snapshot.error) return { ok: false, error: snapshot.error };
  }

  function save(tasks: Task[], epics = snapshot.epics): SaveResult {
    try {
      getStorage().setItem(
        TASK_STORAGE_KEY,
        JSON.stringify({ version: 1, tasks, epics }),
      );
      snapshot = { tasks, epics, ready: true, error: null };
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

  function validateTask(input: CreateTaskInput) {
    const assignees = [
      ...new Set(
        [...seed, ...snapshot.tasks].flatMap((task) =>
          task.assignee ? [task.assignee] : [],
        ),
      ),
    ];
    return createTaskSchema({ epics: snapshot.epics, assignees }).safeParse({
      ...input,
      epic: input.epic ?? "",
      assignee: input.assignee ?? "",
    });
  }

  const missingTask: SaveResult = {
    ok: false,
    error:
      "This task is no longer available. Close the dialog and reload your workspace.",
  };
  function saveTask(updated: Task) {
    return save(
      snapshot.tasks.map((task) => (task.id === updated.id ? updated : task)),
    );
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
    moveTask(id: number, status: TaskStatus): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      const task = snapshot.tasks.find((task) => task.id === id);
      if (!task) return missingTask;
      if (task.status === status) return { ok: true };
      return saveTask({ ...task, status });
    },
    createTask(input: CreateTaskInput): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      const validated = validateTask(input);
      if (!validated.success)
        return { ok: false, error: validated.error.issues[0].message };
      const id = nextId(snapshot.tasks);
      if (!Number.isSafeInteger(id))
        return { ok: false, error: "A new task ID could not be assigned." };
      return save([{ ...validated.data, id, subtasks: [] }, ...snapshot.tasks]);
    },
    updateTask(id: number, input: CreateTaskInput): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      const task = snapshot.tasks.find((task) => task.id === id);
      if (!task) return missingTask;
      const validated = validateTask(input);
      if (!validated.success)
        return { ok: false, error: validated.error.issues[0].message };
      return saveTask({ ...task, ...validated.data });
    },
    createEpic(name: string): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      const validated = createEpicSchema(snapshot.epics).safeParse(name);
      if (!validated.success)
        return { ok: false, error: validated.error.issues[0].message };
      return save(snapshot.tasks, [...snapshot.epics, validated.data]);
    },
    addSubtask(taskId: number, title: string): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      const task = snapshot.tasks.find((task) => task.id === taskId);
      if (!task) return missingTask;
      const validated = subtaskTitleSchema.safeParse(title);
      if (!validated.success)
        return { ok: false, error: validated.error.issues[0].message };
      const id = nextId(task.subtasks);
      if (!Number.isSafeInteger(id))
        return { ok: false, error: "A new subtask ID could not be assigned." };
      return saveTask({
        ...task,
        subtasks: [
          ...task.subtasks,
          { id, title: validated.data, completed: false },
        ],
      });
    },
    setSubtaskCompleted(
      taskId: number,
      subtaskId: number,
      completed: boolean,
    ): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      const task = snapshot.tasks.find((task) => task.id === taskId);
      if (!task) return missingTask;
      if (!task.subtasks.some((subtask) => subtask.id === subtaskId))
        return {
          ok: false,
          error:
            "This subtask is no longer available. Close the dialog and try again.",
        };
      return saveTask({
        ...task,
        subtasks: task.subtasks.map((subtask) =>
          subtask.id === subtaskId ? { ...subtask, completed } : subtask,
        ),
      });
    },
  };
}
