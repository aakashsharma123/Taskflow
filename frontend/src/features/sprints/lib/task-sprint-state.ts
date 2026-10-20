import type { Task } from "@/features/tasks/types/task";
import type { Sprint } from "../types/sprint";

export function taskSprintStatus(
  task: Pick<Task, "sprintId">,
  sprints: readonly Sprint[],
): Sprint["status"] | null {
  return sprints.find((sprint) => sprint.id === task.sprintId)?.status ?? null;
}
