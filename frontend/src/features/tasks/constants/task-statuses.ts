import type { TaskStatus } from "@/features/tasks/types/task";

export const taskColumns = [
  { status: "todo", label: "To do", dot: "bg-slate-400" },
  { status: "in_progress", label: "In progress", dot: "bg-primary" },
  { status: "in_review", label: "In review", dot: "bg-violet-500" },
  { status: "done", label: "Done", dot: "bg-emerald-500" },
] satisfies { status: TaskStatus; label: string; dot: string }[];

export function isTaskStatus(value: unknown): value is TaskStatus {
  return taskColumns.some((column) => column.status === value);
}
