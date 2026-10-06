import type { Task } from "@/features/tasks/types/task";

const epicStyles: Record<string, string> = {
  Authentication: "bg-violet-50 text-violet-800",
  "Task management": "bg-orange-50 text-orange-900",
  Workspace: "bg-teal-50 text-teal-800",
};

const priorityStyles = {
  high: "bg-rose-50 text-rose-800",
  medium: "bg-amber-50 text-amber-900",
  low: "bg-slate-100 text-slate-700",
};

export function TaskCard({ task }: { task: Task }) {
  const initials = task.assignee
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <article className="task-card relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-base-300/80 bg-base-100 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-[10px] font-medium tracking-wide text-base-content/70">
          <span
            aria-hidden="true"
            className="h-1.5 w-5 rounded-full bg-secondary"
          />
          ORB-{task.id}
        </span>
        {task.status === "done" && (
          <span className="flex items-center gap-1 text-[10px] font-medium text-teal-800">
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="size-3.5"
            >
              <circle cx="8" cy="8" r="6" />
              <path d="m5 8 2 2 4-4" />
            </svg>
            Done
          </span>
        )}
      </div>
      <h3 className="min-h-12 text-[13px] leading-6 font-semibold tracking-[-0.01em] [overflow-wrap:anywhere]">
        {task.title}
      </h3>
      <div className="mt-4 mb-5 min-h-7">
        {task.epic && (
          <span
            className={`inline-flex max-w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-medium ${epicStyles[task.epic] ?? "bg-base-200 text-base-content"}`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              className="size-3.5 shrink-0"
            >
              <circle cx="10" cy="10" r="3" fill="currentColor" />
              <ellipse
                cx="10"
                cy="10"
                rx="8"
                ry="4"
                transform="rotate(-35 10 10)"
                stroke="currentColor"
              />
            </svg>
            <span className="[overflow-wrap:anywhere]">{task.epic}</span>
          </span>
        )}
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-base-300/60 pt-3">
        <span
          className="flex min-w-0 items-center gap-2"
          aria-label={
            task.assignee ? `Assigned to ${task.assignee}` : "Unassigned"
          }
          title={task.assignee ?? "Unassigned"}
        >
          <span
            aria-hidden="true"
            className={`grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold ${task.assignee ? "bg-primary text-primary-content" : "border border-dashed border-base-content/30 text-base-content/70"}`}
          >
            {initials ?? "—"}
          </span>
          <span
            aria-hidden="true"
            className="truncate text-[10px] font-medium text-base-content/75"
          >
            {task.assignee?.split(" ")[0] ?? "Unassigned"}
          </span>
        </span>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-medium ${priorityStyles[task.priority]}`}
        >
          <span aria-hidden="true" className="size-1 rounded-full bg-current" />
          <span className="capitalize">{task.priority}</span>
          <span className="sr-only"> priority</span>
        </span>
      </div>
    </article>
  );
}
