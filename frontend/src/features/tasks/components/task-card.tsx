import type { ReactNode } from "react";
import type { Task } from "@/features/tasks/types/task";
import { epicAccent } from "@/features/epics/lib/epic-accent";
import { Lozenge } from "@/shared/ui/lozenge";
import { TaskTypeIcon } from "./task-icons";
import {
  TaskAssignee,
  TaskDueDate,
  TaskLabels,
  TaskPriority,
} from "./task-metadata";

export function TaskCard({
  task,
  epics,
  onOpen,
  dragHandle,
}: {
  task: Task;
  epics: string[];
  onOpen: () => void;
  dragHandle: ReactNode;
}) {
  const completedSubtasks = task.subtasks.filter(
    (subtask) => subtask.completed,
  ).length;

  return (
    // The card handles clicks, so the title button and the rest of the card open the same task.
    <article
      onClick={onOpen}
      className="group relative flex min-w-0 cursor-pointer flex-col gap-2 rounded-md bg-base-100 p-3 shadow-raised hover:bg-raised-hover"
    >
      <h3 className="pr-7 [overflow-wrap:anywhere]">
        <button
          type="button"
          aria-haspopup="dialog"
          data-task-id={task.id}
          aria-label={`Open ORB-${task.id}: ${task.title}`}
          className="cursor-pointer text-left"
        >
          {task.title}
        </button>
      </h3>
      <div
        className="absolute top-2 right-2"
        onClick={(event) => event.stopPropagation()}
      >
        {dragHandle}
      </div>
      {task.epic && (
        <div>
          <Lozenge className={epicAccent(epics, task.epic)}>
            {task.epic}
          </Lozenge>
        </div>
      )}
      <TaskLabels task={task} />
      {task.dueDate && (
        <div>
          <TaskDueDate task={task} />
        </div>
      )}
      <div className="flex items-center gap-2">
        <TaskTypeIcon />
        <span className="text-xs font-semibold text-subtle">ORB-{task.id}</span>
        <span className="ml-auto flex items-center gap-2">
          {task.subtasks.length > 0 && (
            <span
              title="Subtasks done"
              className="inline-flex items-center gap-1 text-xs text-subtle"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="size-3.5"
              >
                <rect x="2" y="2" width="12" height="12" rx="2" />
                <path d="m5 8 2 2 4-4" />
              </svg>
              {completedSubtasks}/{task.subtasks.length}
              <span className="sr-only"> subtasks done</span>
            </span>
          )}
          <TaskPriority task={task} />
          <TaskAssignee task={task} />
        </span>
      </div>
    </article>
  );
}
