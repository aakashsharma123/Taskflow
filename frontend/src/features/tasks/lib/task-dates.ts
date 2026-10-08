import type { Task } from "../types/task";

// Calendar dates belong to the user's local day, not a UTC timestamp.
export function localDay(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function isOverdue(task: Task, today = localDay()): boolean {
  return Boolean(
    task.dueDate &&
    task.dueDate < today &&
    task.status !== "done" &&
    !task.archived,
  );
}
export function formatTaskDate(date: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}
