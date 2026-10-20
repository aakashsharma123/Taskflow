import type { Task } from "@/features/tasks/types/task";

const priorityLabels = {
  high: "High",
  medium: "Medium",
  low: "Low",
} satisfies Record<Task["priority"], string>;

export const taskPriorities = (
  ["high", "medium", "low"] satisfies Task["priority"][]
).map((value) => ({ value, label: priorityLabels[value] }));

export function priorityLabel(priority: Task["priority"]) {
  return priorityLabels[priority];
}
