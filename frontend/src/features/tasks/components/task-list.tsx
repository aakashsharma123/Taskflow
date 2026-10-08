import { TaskCard } from "./task-card";
import type { Task } from "@/features/tasks/types/task";
export function TaskList({
  tasks,
  mode,
  disabled,
  onOpen,
  onActivate,
}: {
  tasks: Task[];
  mode: "archive" | "backlog";
  disabled: boolean;
  onOpen: (id: number) => void;
  onActivate: (id: number) => void;
}) {
  return (
    <div
      role="region"
      aria-label={mode === "archive" ? "Archived tasks" : "Backlog tasks"}
      tabIndex={0}
      className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      {tasks.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => (
            <li key={task.id} className="flex flex-col">
              <TaskCard task={task} onOpen={() => onOpen(task.id)} />
              {mode === "backlog" && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm mt-2 self-start"
                  aria-label={`Move ORB-${task.id} to Board`}
                  disabled={disabled}
                  onClick={() => onActivate(task.id)}
                >
                  Move to Board <span aria-hidden="true">↗</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-base-300 px-5 py-12 text-center">
          <h2 className="text-sm font-semibold">
            {mode === "archive"
              ? "No archived tasks in this view"
              : "Your backlog is clear"}
          </h2>
          <p className="mt-2 text-xs leading-6 text-base-content/65">
            {mode === "archive"
              ? "Archive a task from its details, or adjust your filters."
              : "Add a task here to plan it later, or adjust your filters."}
          </p>
        </div>
      )}
    </div>
  );
}
