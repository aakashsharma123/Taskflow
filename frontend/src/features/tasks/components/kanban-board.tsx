"use client";
import { DragDropProvider } from "@dnd-kit/react";
import { DraggableTaskCard } from "./draggable-task-card";
import { BoardColumn } from "./board-column";
import {
  taskColumns,
  isTaskStatus,
} from "@/features/tasks/constants/task-statuses";
import type { Task, TaskStatus } from "@/features/tasks/schemas/types/task";
export function KanbanBoard({
  tasks,
  disabled,
  filtered,
  onOpen,
  onMove,
}: {
  tasks: Task[];
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
        className="board-scroll overflow-x-auto rounded-lg pb-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <div className="grid min-w-[1020px] grid-cols-4 items-stretch gap-4">
          {taskColumns.map((column) => {
            const items = tasks.filter((task) => task.status === column.status);
            return (
              <BoardColumn key={column.status} status={column.status}>
                <div className="flex items-center gap-2 px-1.5 pt-2 pb-4">
                  <span
                    aria-hidden="true"
                    className={`size-2 rounded-full ${column.dot}`}
                  />
                  <h2
                    id={`column-${column.status}`}
                    className="text-[11px] font-semibold tracking-wider text-base-content/75 uppercase"
                  >
                    {column.label}
                  </h2>
                  <span
                    aria-label={`${items.length} tasks`}
                    className="rounded bg-base-300/60 px-1.5 py-0.5 text-[10px] font-medium text-base-content/70"
                  >
                    {items.length}
                  </span>
                </div>
                {items.length ? (
                  <ul
                    aria-label={`${column.label} tasks`}
                    className="flex flex-col gap-3"
                  >
                    {items.map((task) => (
                      <li key={task.id}>
                        <DraggableTaskCard
                          disabled={disabled}
                          task={task}
                          onOpen={() => onOpen(task.id)}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-md border border-dashed border-base-300 px-4 py-8 text-center text-xs leading-6 text-base-content/65">
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
