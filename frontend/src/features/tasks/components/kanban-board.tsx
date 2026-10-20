"use client";
import { m } from "framer-motion";
import { DragDropProvider } from "@dnd-kit/react";
import { DraggableTaskCard } from "./draggable-task-card";
import { BoardColumn } from "./board-column";
import {
  taskColumns,
  isTaskStatus,
} from "@/features/tasks/constants/task-statuses";
import type { Task, TaskStatus } from "@/features/tasks/types/task";
export function KanbanBoard({
  tasks,
  epics,
  disabled,
  filtered,
  onOpen,
  onMove,
}: {
  tasks: Task[];
  epics: string[];
  disabled: boolean;
  filtered: boolean;
  onOpen: (id: number) => void;
  onMove: (id: number, status: TaskStatus) => void;
}) {
  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;
        const { source, target } = event.operation;
        if (
          !source ||
          typeof source.id !== "number" ||
          !target ||
          !isTaskStatus(target.id)
        )
          return;
        onMove(source.id, target.id);
      }}
    >
      <div
        role="region"
        aria-label="Task board, scroll horizontally to see all columns"
        tabIndex={0}
        className="board-scroll snap-x snap-proximity overflow-x-auto rounded-2xl pb-5"
      >
        <div className="grid grid-cols-[repeat(4,minmax(min(78vw,17rem),1fr))] items-stretch gap-4">
          {taskColumns.map((column) => {
            const items = tasks.filter((task) => task.status === column.status);
            return (
              <BoardColumn key={column.status} status={column.status}>
                <div className="flex items-center gap-2 px-1.5 pt-2 pb-4">
                  <h2
                    id={`column-${column.status}`}
                    className="flex flex-1 items-center gap-2.5 text-[13px] font-semibold"
                  >
                    <span
                      aria-hidden="true"
                      className={`size-2 rounded-full ${column.status === "done" ? "bg-icon-done" : column.status === "in_progress" ? "bg-icon-task" : column.status === "in_review" ? "bg-icon-epic" : "bg-subtlest"}`}
                    />
                    {column.label}{" "}
                    <span className="ml-auto rounded-md border border-line bg-base-100/70 px-1.5 py-0.5 text-[11px] font-medium text-subtle tabular-nums">
                      {items.length}
                      <span className="sr-only"> tasks</span>
                    </span>
                  </h2>
                  {column.status === "done" && (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-4 text-icon-done"
                    >
                      <path d="m3.5 8.5 3 3 6-7" />
                    </svg>
                  )}
                </div>
                {items.length ? (
                  <ul
                    aria-label={`${column.label} tasks`}
                    className="flex flex-col gap-3"
                  >
                    {items.map((task, index) => (
                      <m.li
                        key={task.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          duration: 0.2,
                          delay: Math.min(index, 5) * 0.035,
                        }}
                      >
                        <DraggableTaskCard
                          disabled={disabled}
                          task={task}
                          epics={epics}
                          onOpen={() => onOpen(task.id)}
                        />
                      </m.li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-xl border border-dashed border-line-input/50 px-4 py-10 text-center text-xs leading-6 text-subtlest">
                    {filtered ? "No matching tasks" : "No tasks here yet"}
                  </p>
                )}
              </BoardColumn>
            );
          })}
        </div>
      </div>
    </DragDropProvider>
  );
}
