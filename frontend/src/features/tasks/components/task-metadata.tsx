import type { Task } from "../types/task";
import { formatTaskDate, isOverdue } from "../lib/task-dates";
import { priorityLabel } from "../constants/task-priorities";
import { Avatar } from "@/shared/ui/avatar";
import { PriorityIcon } from "./task-icons";

export function TaskLabel({ label }: { label: string }) {
  return (
    <span className="inline-flex max-w-full rounded-md bg-panel-soft px-2 text-[11px] leading-5 text-tint-gray-text [overflow-wrap:anywhere]">
      {label}
    </span>
  );
}

export function TaskLabels({ task }: { task: Task }) {
  if (task.labels.length === 0) return null;
  return (
    <ul aria-label={`ORB-${task.id} labels`} className="flex flex-wrap gap-1">
      {task.labels.map((label) => (
        <li key={label} className="min-w-0 max-w-full">
          <TaskLabel label={label} />
        </li>
      ))}
    </ul>
  );
}

export function TaskDueDate({ task }: { task: Task }) {
  if (!task.dueDate) return null;
  const overdue = isOverdue(task);
  return (
    <span
      title={overdue ? "Overdue" : "Due date"}
      className={`inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 text-[11px] leading-5 font-medium ${overdue ? "bg-danger-subtle text-danger-text" : "bg-tint-gray text-tint-gray-text"}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="size-3.5"
      >
        {overdue ? (
          <path d="M8 2 1.75 13.5h12.5zM8 6.5v3M8 11.5v.01" />
        ) : (
          <>
            <rect x="2" y="3" width="12" height="11" rx="1.5" />
            <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" />
          </>
        )}
      </svg>
      <span className="sr-only">{overdue ? "Overdue, due " : "Due "}</span>
      <time dateTime={task.dueDate}>{formatTaskDate(task.dueDate)}</time>
    </span>
  );
}

export function TaskPriority({ task }: { task: Task }) {
  const label = `${priorityLabel(task.priority)} priority`;
  return (
    <span title={label} className="inline-flex">
      <PriorityIcon priority={task.priority} />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function TaskAssignee({ task }: { task: Task }) {
  const label = task.assignee ? `Assigned to ${task.assignee}` : "Unassigned";
  return (
    <span title={label} className="inline-flex">
      <Avatar name={task.assignee} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
