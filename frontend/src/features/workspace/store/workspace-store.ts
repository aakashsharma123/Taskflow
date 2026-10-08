import { commentBodySchema } from "@/features/tasks/schemas/task-comment-schema";
import * as sprintCommands from "@/features/sprints/lib/sprint-commands";
import {
  assertWorkspaceSize,
  parseWorkspaceBackup,
} from "@/features/workspace/lib/workspace-backup";
import {
  projectSettingsSchema,
  memberNameSchema,
  type ProjectSettingsInput,
} from "@/features/settings/schemas/workspace-settings-schema";
import type { WorkspaceSettings } from "@/features/settings/types/workspace-settings";
import type { CreateSprintInput } from "@/features/sprints/schemas/sprint-schema";
import type { Sprint } from "@/features/sprints/types/sprint";
import { recordTaskActivity } from "@/features/tasks/lib/task-activity";
import {
  recordWorkspaceDay,
  type DailySummary,
} from "@/features/dashboard/lib/workspace-history";
import type {
  Task,
  TaskStatus,
  TaskPlacement,
} from "@/features/tasks/types/task";
import {
  createTaskSchema,
  type CreateTaskInput,
} from "@/features/tasks/schemas/create-task-schema";
import { subtaskTitleSchema } from "@/features/tasks/schemas/subtask-schema";
import { createEpicSchema } from "@/features/epics/schemas/create-epic-schema";

export const WORKSPACE_STORAGE_KEY = "orbit.workspace.v1";

type Snapshot = {
  workspaceId: string | null;
  tasks: Task[];
  removedTasks: Task[];
  history: DailySummary[];
  epics: string[];
  sprints: Sprint[];
  settings: WorkspaceSettings;
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

export function createWorkspaceStore(
  seed: Task[],
  getStorage: () => StorageClient,
  now: () => Date = () => new Date(),
) {
  const serverSnapshot: Snapshot = {
    workspaceId: null,
    tasks: seed,
    removedTasks: [],
    history: [],
    epics: taskEpics(seed),
    sprints: [],
    settings: {
      currentMember: null,
      projectName: "Orbit",
      appearance: "apricot",
      members: [
        ...new Set(
          seed.flatMap((task) => (task.assignee ? [task.assignee] : [])),
        ),
      ],
    },
    ready: false,
    error: null,
  };
  let snapshot = serverSnapshot;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());

  function load() {
    try {
      const raw = getStorage().getItem(WORKSPACE_STORAGE_KEY);
      const saved = raw === null ? null : parseWorkspaceBackup(raw);
      const tasks = saved?.tasks ?? seed;
      const removedTasks = saved?.removedTasks ?? [];
      const epics = saved?.epics ?? serverSnapshot.epics;
      const sprints = saved?.sprints ?? [];
      const settings = saved?.settings ?? serverSnapshot.settings;
      snapshot = {
        workspaceId: saved?.workspaceId ?? null,
        tasks,
        removedTasks,
        epics,
        sprints,
        settings,
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

  function prepare(): Extract<SaveResult, { ok: false }> | undefined {
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
    settings = snapshot.settings,
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
      const data = JSON.stringify({
        version: 1,
        workspaceId: snapshot.workspaceId,
        tasks,
        epics,
        removedTasks,
        history,
        sprints,
        settings,
      });
      assertWorkspaceSize(data);
      getStorage().setItem(WORKSPACE_STORAGE_KEY, data);
      snapshot = {
        workspaceId: snapshot.workspaceId,
        tasks,
        removedTasks,
        epics,
        sprints,
        settings,
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

  function saveSprintChange(result: sprintCommands.SprintChange): SaveResult {
    return result.ok
      ? save(
          result.tasks,
          snapshot.epics,
          snapshot.removedTasks,
          result.sprints,
        )
      : result;
  }

  function validateTask(input: CreateTaskInput) {
    const assignees = snapshot.settings.members;
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
    exportWorkspace():
      { ok: true; data: string } | { ok: false; error: string } {
      const blocked = prepare();
      if (blocked) return blocked;
      const { tasks, removedTasks, epics, sprints, settings, history } =
        snapshot;
      return {
        ok: true,
        data: JSON.stringify({
          version: 1,
          tasks,
          removedTasks,
          epics,
          sprints,
          settings,
          history,
        }),
      };
    },
    importWorkspace(raw: string): SaveResult {
      // Explicit replacement also permits recovery from corrupt local storage.
      let imported: ReturnType<typeof parseWorkspaceBackup>;
      try {
        imported = parseWorkspaceBackup(raw);
      } catch {
        return {
          ok: false,
          error:
            "This file is not a valid Orbit workspace backup. Your current data has not changed.",
        };
      }
      try {
        imported = { ...imported, workspaceId: crypto.randomUUID() };
        const data = JSON.stringify(imported);
        assertWorkspaceSize(data);
        getStorage().setItem(WORKSPACE_STORAGE_KEY, data);
        snapshot = { ...imported, ready: true, error: null };
        emit();
        return { ok: true };
      } catch {
        return {
          ok: false,
          error:
            "The backup could not be saved. Check browser storage and try again.",
        };
      }
    },
    clearWorkspace(): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      const { settings } = snapshot;
      const data = {
        version: 1 as const,
        workspaceId: crypto.randomUUID(),
        tasks: [],
        removedTasks: [],
        epics: [],
        sprints: [],
        history: [],
        settings,
      };
      try {
        getStorage().setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(data));
        snapshot = { ...data, ready: true, error: null };
        emit();
        return { ok: true };
      } catch {
        return {
          ok: false,
          error:
            "Your workspace could not be cleared. Check browser storage and try again.",
        };
      }
    },
    selectMember(name: string | null): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      if (name !== null && !snapshot.settings.members.includes(name))
        return { ok: false, error: "This member is no longer available." };
      return save(
        snapshot.tasks,
        snapshot.epics,
        snapshot.removedTasks,
        snapshot.sprints,
        { ...snapshot.settings, currentMember: name },
      );
    },
    updateSettings(input: ProjectSettingsInput): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      const validated = projectSettingsSchema.safeParse(input);
      if (!validated.success)
        return { ok: false, error: validated.error.issues[0].message };
      return save(
        snapshot.tasks,
        snapshot.epics,
        snapshot.removedTasks,
        snapshot.sprints,
        { ...snapshot.settings, ...validated.data },
      );
    },
    addMember(name: string): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      const validated = memberNameSchema.safeParse(name);
      if (!validated.success)
        return { ok: false, error: validated.error.issues[0].message };
      if (
        snapshot.settings.members.some(
          (member) => member.toLowerCase() === validated.data.toLowerCase(),
        )
      )
        return { ok: false, error: "This member name already exists." };
      if (snapshot.settings.members.length >= 50)
        return {
          ok: false,
          error: "This workspace supports up to 50 local members.",
        };
      return save(
        snapshot.tasks,
        snapshot.epics,
        snapshot.removedTasks,
        snapshot.sprints,
        {
          ...snapshot.settings,
          members: [...snapshot.settings.members, validated.data],
        },
      );
    },
    removeMember(name: string): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      if (!snapshot.settings.members.includes(name))
        return { ok: false, error: "This member is no longer available." };
      const unassign = (tasks: Task[]) =>
        tasks.map((task) =>
          task.assignee === name ? { ...task, assignee: null } : task,
        );
      return save(
        unassign(snapshot.tasks),
        snapshot.epics,
        unassign(snapshot.removedTasks),
        snapshot.sprints,
        {
          ...snapshot.settings,
          currentMember:
            snapshot.settings.currentMember === name
              ? null
              : snapshot.settings.currentMember,
          members: snapshot.settings.members.filter(
            (member) => member !== name,
          ),
        },
      );
    },
    createSprint(input: CreateSprintInput): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      return saveSprintChange(sprintCommands.createSprint(snapshot, input));
    },
    assignSprint(taskId: number, sprintId: number | null): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      return saveSprintChange(
        sprintCommands.assignSprint(snapshot, taskId, sprintId),
      );
    },
    startSprint(id: number): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      return saveSprintChange(sprintCommands.startSprint(snapshot, id));
    },
    completeSprint(id: number): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      return saveSprintChange(sprintCommands.completeSprint(snapshot, id));
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
          comments: [],
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
    renameEpic(name: string, nextName: string): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      if (!snapshot.epics.includes(name))
        return { ok: false, error: "This epic is no longer available." };
      const validated = createEpicSchema(
        snapshot.epics.filter((epic) => epic !== name),
      ).safeParse(nextName);
      if (!validated.success)
        return { ok: false, error: validated.error.issues[0].message };
      const rename = (tasks: Task[]) =>
        tasks.map((task) =>
          task.epic === name ? { ...task, epic: validated.data } : task,
        );
      return save(
        rename(snapshot.tasks),
        snapshot.epics.map((epic) => (epic === name ? validated.data : epic)),
        rename(snapshot.removedTasks),
      );
    },
    deleteEpic(name: string): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      if (!snapshot.epics.includes(name))
        return { ok: false, error: "This epic is no longer available." };
      const unlink = (tasks: Task[]) =>
        tasks.map((task) =>
          task.epic === name ? { ...task, epic: null } : task,
        );
      return save(
        unlink(snapshot.tasks),
        snapshot.epics.filter((epic) => epic !== name),
        unlink(snapshot.removedTasks),
      );
    },
    addComment(taskId: number, body: string): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      const task = snapshot.tasks.find((task) => task.id === taskId);
      if (!task) return missingTask;
      const validated = commentBodySchema.safeParse(body);
      if (!validated.success)
        return { ok: false, error: validated.error.issues[0].message };
      if (task.comments.length >= 200)
        return {
          ok: false,
          error: "This task has reached its limit of 200 comments.",
        };
      return saveTask({
        ...task,
        comments: [
          ...task.comments,
          {
            id: crypto.randomUUID(),
            author: snapshot.settings.currentMember ?? "Local user",
            body: validated.data,
            createdAt: now().toISOString(),
            updatedAt: null,
          },
        ],
      });
    },
    editComment(taskId: number, commentId: string, body: string): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      const task = snapshot.tasks.find((task) => task.id === taskId);
      if (!task) return missingTask;
      const comment = task.comments.find((comment) => comment.id === commentId);
      if (!comment)
        return { ok: false, error: "This comment is no longer available." };
      const validated = commentBodySchema.safeParse(body);
      if (!validated.success)
        return { ok: false, error: validated.error.issues[0].message };
      if (comment.body === validated.data) return { ok: true };
      return saveTask({
        ...task,
        comments: task.comments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                body: validated.data,
                updatedAt: now().toISOString(),
              }
            : comment,
        ),
      });
    },
    deleteComment(taskId: number, commentId: string): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      const task = snapshot.tasks.find((task) => task.id === taskId);
      if (!task) return missingTask;
      if (!task.comments.some((comment) => comment.id === commentId))
        return { ok: false, error: "This comment is no longer available." };
      return saveTask({
        ...task,
        comments: task.comments.filter((comment) => comment.id !== commentId),
      });
    },
    renameSubtask(
      taskId: number,
      subtaskId: number,
      title: string,
    ): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      const task = snapshot.tasks.find((task) => task.id === taskId);
      if (!task) return missingTask;
      if (!task.subtasks.some((item) => item.id === subtaskId))
        return { ok: false, error: "This subtask is no longer available." };
      const validated = subtaskTitleSchema.safeParse(title);
      if (!validated.success)
        return { ok: false, error: validated.error.issues[0].message };
      return saveTask({
        ...task,
        subtasks: task.subtasks.map((item) =>
          item.id === subtaskId ? { ...item, title: validated.data } : item,
        ),
      });
    },
    deleteSubtask(taskId: number, subtaskId: number): SaveResult {
      const blocked = prepare();
      if (blocked) return blocked;
      const task = snapshot.tasks.find((task) => task.id === taskId);
      if (!task) return missingTask;
      if (!task.subtasks.some((item) => item.id === subtaskId))
        return { ok: false, error: "This subtask is no longer available." };
      return saveTask({
        ...task,
        subtasks: task.subtasks.filter((item) => item.id !== subtaskId),
      });
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
