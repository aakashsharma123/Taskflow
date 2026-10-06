import type { Task } from "@/features/tasks/schemas/types/task";
import type { DailySummary } from "@/features/tasks/store/workspace-history";
import { taskColumns } from "@/features/tasks/constants/task-statuses";
export function summarizeProject(tasks: Task[], epics: string[]) {
  const active = tasks.filter((task) => !task.archived);
  const board = active.filter((task) => task.placement === "board");
  const completed = tasks.filter((task) => task.status === "done").length;
  return {
    total: tasks.length,
    board: board.length,
    backlog: active.filter((task) => task.placement === "backlog").length,
    archived: tasks.length - active.length,
    completed,
    completionRate: tasks.length
      ? Math.round((completed / tasks.length) * 100)
      : 0,
    highPriorityOpen: active.filter(
      (task) => task.priority === "high" && task.status !== "done",
    ).length,
    statuses: taskColumns.map((column) => ({
      ...column,
      count: board.filter((task) => task.status === column.status).length,
    })),
    epics: epics.map((name) => {
      const items = tasks.filter((task) => task.epic === name);
      const done = items.filter((task) => task.status === "done").length;
      return {
        name,
        total: items.length,
        completed: done,
        percent: items.length ? Math.round((done / items.length) * 100) : 0,
      };
    }),
  };
}
// Unknown dates stay null. A known total carries forward on days without changes.
export function completionTrend(
  history: DailySummary[],
  tasks: Task[],
  today: string,
) {
  const start = new Date(`${today}T00:00:00Z`);
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(date.getUTCDate() - 6 + index);
    const key = date.toISOString().slice(0, 10);
    const recorded = sorted.findLast((day) => day.date <= key);
    return {
      date: key,
      completed:
        key === today
          ? tasks.filter((task) => task.status === "done").length
          : (recorded?.completed ?? null),
    };
  });
}
