import type { Task } from "@/features/tasks/types/task";
import { isOverdue, localDay } from "./task-dates";
export type TaskSort = "newest" | "oldest" | "priority" | "title" | "dueDate";
export type TaskFilters = {
  search: string;
  epic: string;
  assignee: string;
  priority: string;
  status: string;
  label: string;
  due: string;
  sprint: string;
  sort: TaskSort;
};
export const defaultTaskFilters: TaskFilters = {
  search: "",
  epic: "",
  assignee: "",
  priority: "",
  status: "",
  label: "",
  due: "",
  sprint: "",
  sort: "newest",
};
export const hasTaskFilters = (filters: TaskFilters) =>
  Boolean(
    filters.search ||
    filters.epic ||
    filters.assignee ||
    filters.priority ||
    filters.status ||
    filters.label ||
    filters.due ||
    filters.sprint ||
    filters.sort !== "newest",
  );
const priorityRank = { high: 0, medium: 1, low: 2 };
export function filterTasks(
  tasks: readonly Task[],
  filters: TaskFilters,
  today = localDay(),
): Task[] {
  const query = filters.search.trim().toLowerCase();
  return tasks
    .filter(
      (task) =>
        (!query ||
          task.title.toLowerCase().includes(query) ||
          `orb-${task.id}`.includes(query)) &&
        (!filters.epic || task.epic === filters.epic) &&
        (!filters.assignee ||
          (filters.assignee === "unassigned"
            ? task.assignee === null
            : task.assignee === filters.assignee)) &&
        (!filters.priority || task.priority === filters.priority) &&
        (!filters.status || task.status === filters.status) &&
        (!filters.sprint ||
          (filters.sprint === "none"
            ? task.sprintId === null
            : task.sprintId === Number(filters.sprint))) &&
        (!filters.label || task.labels.includes(filters.label)) &&
        (!filters.due ||
          (filters.due === "overdue"
            ? isOverdue(task, today)
            : filters.due === "today"
              ? task.dueDate === today
              : task.dueDate === null)),
    )
    .sort((a, b) => {
      if (filters.sort === "dueDate")
        return (
          (a.dueDate ?? "9999-12-31").localeCompare(
            b.dueDate ?? "9999-12-31",
          ) || b.id - a.id
        );
      if (filters.sort === "oldest") return a.id - b.id;
      if (filters.sort === "title")
        return a.title.localeCompare(b.title) || b.id - a.id;
      if (filters.sort === "priority")
        return (
          priorityRank[a.priority] - priorityRank[b.priority] || b.id - a.id
        );
      return b.id - a.id;
    });
}
