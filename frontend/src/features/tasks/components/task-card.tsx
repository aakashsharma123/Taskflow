"use client";

import { m } from "framer-motion";
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
  isDragging = false,
}: {
  task: Task;
  epics: string[];
  onOpen: () => void;
  dragHandle: ReactNode;
  isDragging?: boolean;
}) {
  const completedSubtasks = task.subtasks.filter(
    (subtask) => subtask.completed,
  ).length;
  return (
    <m.article
      onClick={onOpen}
      whileHover={isDragging ? undefined : { y: -2 }}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
      className="task-card group relative flex min-w-0 cursor-pointer flex-col gap-3.5 p-4"
    >
      <div className="flex items-center gap-2">
        <TaskTypeIcon />
        <span className="text-[11px] font-medium tracking-wide text-subtlest tabular-nums">
          ORB-{task.id}
        </span>
        <span className="ml-auto">
          <TaskPriority task={task} />
        </span>
        <div onClick={(event) => event.stopPropagation()}>{dragHandle}</div>
      </div>
      <h3 className="text-sm leading-[1.6] font-medium [overflow-wrap:anywhere]">
        <button
          type="button"
          aria-haspopup="dialog"
          data-task-id={task.id}
          aria-label={`Open ORB-${task.id}: ${task.title}`}
          className="cursor-pointer rounded text-left"
        >
          {task.title}
        </button>
      </h3>
      {task.epic && (
        <div>
          <Lozenge className={epicAccent(epics, task.epic)}>
            {task.epic}
          </Lozenge>
        </div>
      )}
      <TaskLabels task={task} />
      <div className="mt-0.5 flex flex-wrap items-center gap-2 border-t border-line pt-3">
        {task.dueDate && <TaskDueDate task={task} />}
        {task.subtasks.length > 0 && (
          <span
            title="Subtasks done"
            className="inline-flex items-center gap-1.5 text-[11px] text-subtle tabular-nums"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="size-3.5"
            >
              <rect x="2" y="2" width="12" height="12" rx="3" />
              <path d="m5 8 2 2 4-4" />
            </svg>
            {completedSubtasks}/{task.subtasks.length}
            <span className="sr-only"> subtasks done</span>
          </span>
        )}
        {!task.dueDate && task.subtasks.length === 0 && (
          <span className="text-[11px] text-subtlest">
            {task.status === "done" ? "Completed" : "No due date"}
          </span>
        )}
        <span className="ml-auto">
          <TaskAssignee task={task} />
        </span>
      </div>
    </m.article>
  );
}
