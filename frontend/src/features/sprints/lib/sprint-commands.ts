import {
  createSprintSchema,
  type CreateSprintInput,
} from "../schemas/sprint-schema";
import type { Sprint } from "../types/sprint";
import type { Task } from "@/features/tasks/types/task";
import { taskSprintStatus } from "./task-sprint-state";

type SprintState = { tasks: Task[]; sprints: Sprint[] };
export type SprintChange =
  { ok: true; tasks: Task[]; sprints: Sprint[] } | { ok: false; error: string };
const nextId = (items: { id: number }[]) =>
  items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
const sprintChange = (tasks: Task[], sprints: Sprint[]): SprintChange => ({
  ok: true,
  tasks,
  sprints,
});
const updateSprintTask = (state: SprintState, updated: Task) =>
  sprintChange(
    state.tasks.map((task) => (task.id === updated.id ? updated : task)),
    state.sprints,
  );

export function createSprint(
  state: SprintState,
  input: CreateSprintInput,
): SprintChange {
  const validated = createSprintSchema.safeParse(input);
  if (!validated.success)
    return { ok: false, error: validated.error.issues[0].message };
  if (
    state.sprints.some(
      (sprint) =>
        sprint.name.toLowerCase() === validated.data.name.toLowerCase(),
    )
  )
    return { ok: false, error: "Choose a unique sprint name." };
  const id = nextId(state.sprints);
  if (!Number.isSafeInteger(id))
    return { ok: false, error: "A sprint ID could not be assigned." };
  return sprintChange(state.tasks, [
    ...state.sprints,
    { ...validated.data, id, status: "planned", summary: null },
  ]);
}
export function assignSprint(
  state: SprintState,
  taskId: number,
  sprintId: number | null,
): SprintChange {
  const task = state.tasks.find((task) => task.id === taskId);
  if (!task || task.archived)
    return {
      ok: false,
      error: "This task is no longer available for sprint planning.",
    };
  const sprint = state.sprints.find((sprint) => sprint.id === sprintId);
  if (sprintId !== null && (!sprint || sprint.status === "completed"))
    return { ok: false, error: "Choose a planned or active sprint." };
  if (taskSprintStatus(task, state.sprints) === "completed")
    return {
      ok: false,
      error: "Reopen this completed task before changing its sprint.",
    };
  return updateSprintTask(state, {
    ...task,
    sprintId,
    placement: sprint?.status === "active" ? "board" : task.placement,
  });
}
export function startSprint(state: SprintState, id: number): SprintChange {
  const sprint = state.sprints.find((sprint) => sprint.id === id);
  if (!sprint || sprint.status !== "planned")
    return { ok: false, error: "Only a planned sprint can be started." };
  if (state.sprints.some((sprint) => sprint.status === "active"))
    return {
      ok: false,
      error: "Complete the active sprint before starting another.",
    };
  if (!state.tasks.some((task) => task.sprintId === id && !task.archived))
    return {
      ok: false,
      error: "Add at least one task before starting this sprint.",
    };
  return sprintChange(
    state.tasks.map((task) =>
      task.sprintId === id ? { ...task, placement: "board" } : task,
    ),
    state.sprints.map((sprint) =>
      sprint.id === id ? { ...sprint, status: "active" } : sprint,
    ),
  );
}
export function completeSprint(state: SprintState, id: number): SprintChange {
  const sprint = state.sprints.find((sprint) => sprint.id === id);
  if (!sprint || sprint.status !== "active")
    return { ok: false, error: "Only the active sprint can be completed." };
  const members = state.tasks.filter(
    (task) => task.sprintId === id && !task.archived,
  );
  const completed = members.filter((task) => task.status === "done").length;
  const tasks = state.tasks.map((task) =>
    task.sprintId === id && task.status !== "done"
      ? { ...task, sprintId: null, placement: "backlog" as const }
      : task,
  );
  return sprintChange(
    tasks,
    state.sprints.map((sprint) =>
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
}
