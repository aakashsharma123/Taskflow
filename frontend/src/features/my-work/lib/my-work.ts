import type { Task } from "@/features/tasks/types/task";
export function groupMyWork(tasks: Task[], member: string, today: string) {
  const owned = tasks.filter(
    (task) => task.assignee === member && !task.archived,
  );
  const open = owned.filter((task) => task.status !== "done");
  const byDate = (items: Task[]) =>
    [...items].sort(
      (a, b) =>
        (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999") || b.id - a.id,
    );
  return {
    overdue: byDate(
      open.filter((task) => task.dueDate !== null && task.dueDate < today),
    ),
    today: byDate(open.filter((task) => task.dueDate === today)),
    upcoming: byDate(
      open.filter((task) => task.dueDate !== null && task.dueDate > today),
    ),
    undated: byDate(open.filter((task) => task.dueDate === null)),
    completed: byDate(owned.filter((task) => task.status === "done")),
  };
}
