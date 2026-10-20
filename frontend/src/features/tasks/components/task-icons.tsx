import type { Task } from "@/features/tasks/types/task";

export function TaskTypeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="size-4 shrink-0 text-icon-task"
    >
      <rect width="16" height="16" rx="3" fill="currentColor" />
      <path
        d="m4.5 8.25 2.25 2.25 4.75-5"
        fill="none"
        stroke="#fff"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EpicIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="size-4 shrink-0 text-icon-epic"
    >
      <rect width="16" height="16" rx="3" fill="currentColor" />
      <path d="M9.25 2.75 4.5 9h3l-.75 4.25L11.5 7h-3z" fill="#fff" />
    </svg>
  );
}

const priorityIcons = {
  high: { color: "text-icon-high", path: "m3.5 10 4.5-4 4.5 4" },
  medium: { color: "text-icon-medium", path: "M3.5 6h9M3.5 10h9" },
  low: { color: "text-icon-low", path: "m3.5 6 4.5 4 4.5-4" },
};

export function PriorityIcon({ priority }: { priority: Task["priority"] }) {
  const icon = priorityIcons[priority];
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`size-4 shrink-0 ${icon.color}`}
    >
      <path d={icon.path} />
    </svg>
  );
}
