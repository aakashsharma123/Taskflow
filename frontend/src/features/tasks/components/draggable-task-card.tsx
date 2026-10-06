"use client";

import { useDraggable } from "@dnd-kit/react";
import { TaskCard } from "@/features/tasks/components/task-card";
import type { Task } from "@/features/tasks/schemas/types/task";

export function DraggableTaskCard({
  task,
  onOpen,
  disabled,
}: {
  task: Task;
  onOpen: () => void;
  disabled: boolean;
}) {
  const { ref, handleRef, isDragging } = useDraggable({
    id: task.id,
    type: "task",
    disabled,
  });
  return (
    <div ref={ref} className={isDragging ? "opacity-60" : ""}>
      <TaskCard
        task={task}
        onOpen={onOpen}
        dragHandle={
          <button
            ref={handleRef}
            type="button"
            disabled={disabled}
            aria-label={`Move ORB-${task.id}`}
            title="Drag to a column. Keyboard: Space, arrows, Space; Escape to cancel."
            className="grid size-8 touch-none cursor-grab place-items-center rounded-lg text-base-content/65 hover:bg-base-200 active:cursor-grabbing"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 20"
              fill="currentColor"
              className="size-4"
            >
              {[5, 10, 15].flatMap((y) =>
                [5, 11].map((x) => (
                  <circle key={`${x}-${y}`} cx={x} cy={y} r="1.25" />
                )),
              )}
            </svg>
          </button>
        }
      />
    </div>
  );
}
