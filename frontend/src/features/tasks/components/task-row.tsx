import type { ReactNode } from "react";
import type { Task } from "@/features/tasks/types/task";
import { taskColumn } from "@/features/tasks/constants/task-statuses";
import { epicAccent } from "@/features/epics/lib/epic-accent";
import { Lozenge } from "@/shared/ui/lozenge";
import { TaskTypeIcon } from "./task-icons";
import { TaskAssignee, TaskDueDate, TaskPriority } from "./task-metadata";

export function TaskRow({
  task,
  epics,
  onOpen,
  action,
}: {
  task: Task;
  epics: string[];
  onOpen?: () => void;
  action?: ReactNode;
}) {
  const column = taskColumn(task.status);
  return (
    // The row handles clicks, so the title button and the rest of the row open the same task.
    <div
      onClick={onOpen}
      className={`flex flex-wrap items-center gap-x-3 gap-y-3 px-5 py-4 transition-colors hover:bg-raised-hover ${onOpen ? "cursor-pointer" : ""}`}
    >
      <div className="flex min-w-0 flex-1 basis-56 items-center gap-3">
        <TaskTypeIcon />
        <span
          className={`shrink-0 text-xs font-semibold text-subtle ${task.status === "done" ? "line-through" : ""}`}
        >
          ORB-{task.id}
        </span>
        <span className="min-w-0 [overflow-wrap:anywhere]">
          {onOpen ? (
            <button
              type="button"
              aria-haspopup="dialog"
              data-task-id={task.id}
              aria-label={`Open ORB-${task.id}: ${task.title}`}
              className="cursor-pointer text-left hover:underline"
            >
              {task.title}
            </button>
          ) : (
            task.title
          )}
        </span>
      </div>
      <div className="ml-auto flex max-w-full flex-wrap items-center gap-3">
        {task.epic && (
          <span className="hidden max-w-40 sm:inline-flex">
            <Lozenge className={epicAccent(epics, task.epic)}>
              {task.epic}
            </Lozenge>
          </span>
        )}
        <span className="hidden md:inline-flex">
          <TaskDueDate task={task} />
        </span>
        <Lozenge className={column.lozenge}>{column.label}</Lozenge>
        <TaskPriority task={task} />
        <TaskAssignee task={task} />
        {action && (
          <div onClick={(event) => event.stopPropagation()}>{action}</div>
        )}
      </div>
    </div>
  );
}
