import type { TaskStatus } from "@/features/tasks/types/task";

const statuses = {
  todo: { label: "To do", lozenge: "bg-tint-gray text-tint-gray-text" },
  in_progress: {
    label: "In progress",
    lozenge: "bg-tint-blue text-tint-blue-text",
  },
  in_review: {
    label: "In review",
    lozenge: "bg-tint-blue text-tint-blue-text",
  },
  done: { label: "Done", lozenge: "bg-tint-green text-tint-green-text" },
} satisfies Record<TaskStatus, { label: string; lozenge: string }>;

export const taskColumns = (
  ["todo", "in_progress", "in_review", "done"] satisfies TaskStatus[]
).map((status) => ({ status, ...statuses[status] }));

export function isTaskStatus(value: unknown): value is TaskStatus {
  return taskColumns.some((column) => column.status === value);
}

export function taskColumn(status: TaskStatus) {
  return { status, ...statuses[status] };
}
