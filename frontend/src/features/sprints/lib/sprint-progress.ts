import type { Task } from "@/features/tasks/types/task";
import type { Sprint } from "../types/sprint";
export function sprintProgress(sprint: Sprint, tasks: readonly Task[]) {
  const members = tasks.filter(
    (task) => task.sprintId === sprint.id && !task.archived,
  );
  const total = sprint.summary?.total ?? members.length;
  const completed =
    sprint.summary?.completed ??
    members.filter((task) => task.status === "done").length;
  return {
    total,
    completed,
    carried: sprint.summary?.carried ?? 0,
    percent: total ? Math.round((completed / total) * 100) : 0,
  };
}
