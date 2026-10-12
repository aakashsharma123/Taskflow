"use client";
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
        className="board-scroll overflow-x-auto rounded-md pb-4"
      >
        <div className="grid grid-cols-[repeat(4,minmax(15rem,20rem))] items-stretch gap-2">
          {taskColumns.map((column) => {
            const items = tasks.filter((task) => task.status === column.status);
            return (
              <BoardColumn key={column.status} status={column.status}>
                <div className="flex items-center gap-2 px-2 pt-1.5 pb-3">
                  <h2
                    id={`column-${column.status}`}
                    className="text-xs font-semibold tracking-wide text-subtle uppercase"
                  >
                    {column.label}{" "}
                    <span className="font-normal">
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
                    className="flex flex-col gap-1.5"
                  >
                    {items.map((task) => (
                      <li key={task.id}>
                        <DraggableTaskCard
                          disabled={disabled}
                          task={task}
                          epics={epics}
                          onOpen={() => onOpen(task.id)}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-2 py-6 text-center text-xs text-subtle">
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
