"use client";

import { m } from "framer-motion";
import { TaskRow } from "./task-row";
import type { Task } from "@/features/tasks/types/task";
export function TaskList({
  tasks,
  epics,
  mode,
  disabled,
  onOpen,
  onActivate,
}: {
  tasks: Task[];
  epics: string[];
  mode: "archive" | "backlog";
  disabled: boolean;
  onOpen: (id: number) => void;
  onActivate: (id: number) => void;
}) {
  const title = mode === "archive" ? "Archive" : "Backlog";
  return (
    <div
      role="region"
      aria-label={mode === "archive" ? "Archived tasks" : "Backlog tasks"}
      tabIndex={0}
      className="ui-panel overflow-hidden"
    >
      <div className="flex items-center gap-2 border-b border-line bg-panel-soft px-5 py-4">
        <h2 className="font-semibold">{title}</h2>
        <span className="text-subtle">
          {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
        </span>
      </div>
      {tasks.length ? (
        <ul className="divide-y divide-line">
          {tasks.map((task, index) => (
            <m.li
              key={task.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.22, delay: Math.min(index, 6) * 0.025 }}
            >
              <TaskRow
                task={task}
                epics={epics}
                onOpen={() => onOpen(task.id)}
                action={
                  mode === "backlog" && (
                    <button
                      type="button"
                      className="ui-button ui-button-compact"
                      aria-label={`Move ORB-${task.id} to Board`}
                      disabled={disabled}
                      onClick={() => onActivate(task.id)}
                    >
                      Move to Board
                    </button>
                  )
                }
              />
            </m.li>
          ))}
        </ul>
      ) : (
        <div className="px-6 py-16 text-center">
          <h3 className="font-semibold">
            {mode === "archive"
              ? "No archived tasks in this view"
              : "Your backlog is clear"}
          </h3>
          <p className="mt-1 text-subtle">
            {mode === "archive"
              ? "Archive a task from its details, or adjust your filters."
              : "Create a task here to plan it later, or adjust your filters."}
          </p>
        </div>
      )}
    </div>
  );
}
