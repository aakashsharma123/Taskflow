import type { Task } from "../types/task";
import { formatTaskDate, isOverdue } from "../lib/task-dates";

const colors = [
  "bg-violet-50 text-violet-800",
  "bg-teal-50 text-teal-800",
  "bg-sky-50 text-sky-800",
  "bg-orange-50 text-orange-900",
];
function labelColor(label: string) {
  const hash = [...label.toLowerCase()].reduce(
    (sum, letter) => sum + letter.charCodeAt(0),
    0,
  );
  return colors[hash % colors.length];
}
export function TaskLabel({ label }: { label: string }) {
  return (
    <span
      className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-[10px] font-medium [overflow-wrap:anywhere] ${labelColor(label)}`}
    >
      {label}
    </span>
  );
}

export function TaskMetadata({ task }: { task: Task }) {
  const overdue = isOverdue(task);
  return (
    <>
      {task.labels.length > 0 && (
        <ul
          aria-label={`ORB-${task.id} labels`}
          className="mb-3 flex flex-wrap gap-1.5"
        >
          {task.labels.map((label) => (
            <li key={label} className="min-w-0 max-w-full">
              <TaskLabel label={label} />
            </li>
          ))}
        </ul>
      )}
      {task.dueDate && (
        <p
          className={`mb-3 text-[10px] font-medium ${overdue ? "text-rose-800" : "text-base-content/65"}`}
        >
          {overdue ? "Overdue · " : "Due · "}
          <time dateTime={task.dueDate}>{formatTaskDate(task.dueDate)}</time>
        </p>
      )}
    </>
  );
}
