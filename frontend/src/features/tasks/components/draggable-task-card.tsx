"use client";

import { useDraggable } from "@dnd-kit/react";
import { TaskCard } from "@/features/tasks/components/task-card";
import type { Task } from "@/features/tasks/types/task";

export function DraggableTaskCard({
  task,
  epics,
  onOpen,
  disabled,
}: {
  task: Task;
  epics: string[];
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
        epics={epics}
        onOpen={onOpen}
        dragHandle={
          <button
            ref={handleRef}
            type="button"
            disabled={disabled}
            aria-label={`Move ORB-${task.id}`}
            title="Drag to a column. Keyboard: Space, arrows, Space; Escape to cancel."
            className="grid size-6 cursor-grab touch-none place-items-center rounded text-subtle opacity-0 group-hover:opacity-100 hover:bg-hover focus-visible:opacity-100 active:cursor-grabbing disabled:hidden pointer-coarse:opacity-100"
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
