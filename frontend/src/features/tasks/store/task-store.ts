import { z } from "zod";
import {
  createSprintSchema,
  sprintsSchema,
  type CreateSprintInput,
} from "@/features/sprints/schemas/sprint-schema";
import type { Sprint } from "@/features/sprints/types/sprint";
import { recordTaskActivity, taskActivitySchema } from "./task-activity";
import {
  taskLabelsSchema,
  taskDueDateSchema,
} from "../schemas/task-metadata-schema";
import {
  workspaceHistorySchema,
  recordWorkspaceDay,
  type DailySummary,
} from "./workspace-history";
import type {
  Task,
  TaskStatus,
  TaskPlacement,
} from "@/features/tasks/types/task";
import {
  createTaskSchema,
  taskTitleSchema,
  taskDescriptionSchema,
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
  archived: z.boolean().default(false),
  sprintId: idSchema.nullable().default(null),
  placement: z.enum(["board", "backlog"]).default("board"),
  activity: taskActivitySchema,
  title: taskTitleSchema,
  description: taskDescriptionSchema,
  labels: taskLabelsSchema,
  dueDate: taskDueDateSchema,
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
  sprints: sprintsSchema,
  history: workspaceHistorySchema.default([]),
  removedTasks: z.array(savedTaskSchema).default([]),
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
  removedTasks: Task[];
  history: DailySummary[];
  epics: string[];
  sprints: Sprint[];
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

export function createTaskStore(
  seed: Task[],
  getStorage: () => StorageClient,
  now: () => Date = () => new Date(),
) {
  const serverSnapshot: Snapshot = {
    tasks: seed,
    removedTasks: [],
    history: [],
    epics: taskEpics(seed),
    sprints: [],
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
      const removedTasks = saved?.removedTasks ?? [];
      const allTasks = [...tasks, ...removedTasks];
      if (new Set(allTasks.map((task) => task.id)).size !== allTasks.length)
        throw new Error("Duplicate task IDs");
      const epics = saved?.epics ?? taskEpics(allTasks);
      if (
        allTasks.some(
          (task) => task.epic !== null && !epics.includes(task.epic),
        )
      )
        throw new Error("Unknown epic reference");
      const sprints = saved?.sprints ?? [];
      if (
        allTasks.some(
          (task) =>
            task.sprintId !== null &&
            !sprints.some((sprint) => sprint.id === task.sprintId),
        )
      )
        throw new Error("Unknown sprint reference");
      if (
        tasks.some(
          (task) =>
            task.sprintId !== null &&
            (task.archived ||
              (sprints.find((sprint) => sprint.id === task.sprintId)?.status ===
                "active" &&
                task.placement !== "board")),
        )
      )
        throw new Error("Invalid sprint membership");
      snapshot = {
        tasks,
        removedTasks,
        epics,
        sprints,
        history: saved?.history ?? [],
        ready: true,
        error: null,
      };
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

  function save(
    tasks: Task[],
    epics = snapshot.epics,
    removedTasks = snapshot.removedTasks,
    sprints = snapshot.sprints,
  ): SaveResult {
    try {
      const timestamp = now().toISOString();
      const withActivity = (items: Task[], removed: boolean) =>
        items.map((task) => {
          const previous = [...snapshot.tasks, ...snapshot.removedTasks].find(
            (item) => item.id === task.id,
          );
          return {
            ...task,
            activity: recordTaskActivity(
              previous,
              task,
              snapshot.removedTasks.some((item) => item.id === task.id),
              removed,
              timestamp,
            ),
          };
        });
      tasks = withActivity(tasks, false);
      removedTasks = withActivity(removedTasks, true);
      const history = recordWorkspaceDay(
        snapshot.history,
        tasks,
        timestamp.slice(0, 10),
      );
      getStorage().setItem(
        TASK_STORAGE_KEY,
        JSON.stringify({
          version: 1,
          tasks,
          epics,
          removedTasks,
          history,
          sprints,
        }),
      );
      snapshot = {
        tasks,
        removedTasks,
        epics,
        sprints,
        history,
        ready: true,
        error: null,
      };
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
    createSprint(input: CreateSprintInput): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      const validated = createSprintSchema.safeParse(input);
      if (!validated.success)
        return { ok: false, error: validated.error.issues[0].message };
      if (
        snapshot.sprints.some(
          (sprint) =>
            sprint.name.toLowerCase() === validated.data.name.toLowerCase(),
        )
      )
        return { ok: false, error: "Choose a unique sprint name." };
      const id = nextId(snapshot.sprints);
      if (!Number.isSafeInteger(id))
        return { ok: false, error: "A sprint ID could not be assigned." };
      return save(snapshot.tasks, snapshot.epics, snapshot.removedTasks, [
        ...snapshot.sprints,
        { ...validated.data, id, status: "planned", summary: null },
      ]);
    },
    assignSprint(taskId: number, sprintId: number | null): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      const task = snapshot.tasks.find((task) => task.id === taskId);
      if (!task || task.archived) return missingTask;
      const sprint = snapshot.sprints.find((sprint) => sprint.id === sprintId);
      if (sprintId !== null && (!sprint || sprint.status === "completed"))
        return { ok: false, error: "Choose a planned or active sprint." };
      if (
        task.sprintId !== null &&
        snapshot.sprints.some(
          (sprint) =>
            sprint.id === task.sprintId && sprint.status === "completed",
        )
      )
        return {
          ok: false,
          error: "Reopen this completed task before changing its sprint.",
        };
      return saveTask({
        ...task,
        sprintId,
        placement: sprint?.status === "active" ? "board" : task.placement,
      });
    },
    startSprint(id: number): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      const sprint = snapshot.sprints.find((sprint) => sprint.id === id);
      if (!sprint || sprint.status !== "planned")
        return { ok: false, error: "Only a planned sprint can be started." };
      if (snapshot.sprints.some((sprint) => sprint.status === "active"))
        return {
          ok: false,
          error: "Complete the active sprint before starting another.",
        };
      if (
        !snapshot.tasks.some((task) => task.sprintId === id && !task.archived)
      )
        return {
          ok: false,
          error: "Add at least one task before starting this sprint.",
        };
      return save(
        snapshot.tasks.map((task) =>
          task.sprintId === id ? { ...task, placement: "board" } : task,
        ),
        snapshot.epics,
        snapshot.removedTasks,
        snapshot.sprints.map((sprint) =>
          sprint.id === id ? { ...sprint, status: "active" } : sprint,
        ),
      );
    },
    completeSprint(id: number): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      const sprint = snapshot.sprints.find((sprint) => sprint.id === id);
      if (!sprint || sprint.status !== "active")
        return { ok: false, error: "Only the active sprint can be completed." };
      const members = snapshot.tasks.filter(
        (task) => task.sprintId === id && !task.archived,
      );
      const completed = members.filter((task) => task.status === "done").length;
      const tasks = snapshot.tasks.map((task) =>
        task.sprintId === id && task.status !== "done"
          ? { ...task, sprintId: null, placement: "backlog" as const }
          : task,
      );
      return save(
        tasks,
        snapshot.epics,
        snapshot.removedTasks,
        snapshot.sprints.map((sprint) =>
          sprint.id === id
            ? {
                ...sprint,
                status: "completed",
                summary: {
                  total: members.length,
                  completed,
                  carried: members.length - completed,
                },
              }
            : sprint,
        ),
      );
    },
    setPlacement(id: number, placement: TaskPlacement): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      const task = snapshot.tasks.find((task) => task.id === id);
      if (!task || task.archived) return missingTask;
      if (
        placement === "backlog" &&
        snapshot.sprints.some(
          (sprint) => sprint.id === task.sprintId && sprint.status === "active",
        )
      )
        return {
          ok: false,
          error:
            "Remove this task from its active sprint before moving it to Backlog.",
        };
      return saveTask({ ...task, placement });
    },
    setArchived(id: number, archived: boolean): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      const task = snapshot.tasks.find((task) => task.id === id);
      if (!task) return missingTask;
      return saveTask({
        ...task,
        archived,
        sprintId: archived ? null : task.sprintId,
      });
    },
    deleteTask(id: number): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      const task = snapshot.tasks.find((task) => task.id === id);
      if (!task) return missingTask;
      return save(
        snapshot.tasks.filter((task) => task.id !== id),
        snapshot.epics,
        [...snapshot.removedTasks, task],
      );
    },
    restoreDeletedTask(id: number): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      const task = snapshot.removedTasks.find((task) => task.id === id);
      if (!task) return missingTask;
      return save(
        [
          {
            ...task,
            placement: snapshot.sprints.some(
              (sprint) =>
                sprint.id === task.sprintId && sprint.status === "active",
            )
              ? "board"
              : task.placement,
            sprintId:
              snapshot.sprints.some(
                (sprint) =>
                  sprint.id === task.sprintId && sprint.status === "completed",
              ) && task.status !== "done"
                ? null
                : task.sprintId,
          },
          ...snapshot.tasks,
        ],
        snapshot.epics,
        snapshot.removedTasks.filter((task) => task.id !== id),
      );
    },
    moveTask(id: number, status: TaskStatus): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      const task = snapshot.tasks.find((task) => task.id === id);
      if (!task) return missingTask;
      if (task.status === status) return { ok: true };
      return saveTask({
        ...task,
        status,
        sprintId:
          status !== "done" &&
          snapshot.sprints.some(
            (sprint) =>
              sprint.id === task.sprintId && sprint.status === "completed",
          )
            ? null
            : task.sprintId,
      });
    },
    createTask(
      input: CreateTaskInput,
      placement: TaskPlacement = "board",
    ): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      const validated = validateTask(input);
      if (!validated.success)
        return { ok: false, error: validated.error.issues[0].message };
      const id = nextId([...snapshot.tasks, ...snapshot.removedTasks]);
      if (!Number.isSafeInteger(id))
        return { ok: false, error: "A new task ID could not be assigned." };
      return save([
        {
          ...validated.data,
          id,
          activity: [],
          sprintId: null,
          subtasks: [],
          archived: false,
          placement,
        },
        ...snapshot.tasks,
      ]);
    },
    updateTask(id: number, input: CreateTaskInput): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      const task = snapshot.tasks.find((task) => task.id === id);
      if (!task) return missingTask;
      const validated = validateTask(input);
      if (!validated.success)
        return { ok: false, error: validated.error.issues[0].message };
      return saveTask({
        ...task,
        ...validated.data,
        sprintId:
          validated.data.status !== "done" &&
          snapshot.sprints.some(
            (sprint) =>
              sprint.id === task.sprintId && sprint.status === "completed",
          )
            ? null
            : task.sprintId,
      });
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
