"use client";
import { useState } from "react";
import type { Task, TaskPlacement } from "@/features/tasks/types/task";
import type { SaveResult } from "@/features/tasks/store/task-store";
export function TaskPlacementAction({
  task,
  onMove,
}: {
  task: Task;
  onMove: (placement: TaskPlacement) => SaveResult;
}) {
  const [error, setError] = useState("");
  const destination = task.placement === "board" ? "backlog" : "board";
  return (
    <section
      aria-label="Task location"
      className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-start gap-x-3"
    >
      <span className="pt-1.5 text-sm font-medium text-subtle">Location</span>
      <div className="min-w-0">
        <p className="pt-1.5">
          {task.placement === "board" ? "Board" : "Backlog"}
        </p>
        <button
          type="button"
          className="ui-button ui-button-compact mt-1"
          onClick={() => {
            const result = onMove(destination);
            if (!result.ok) setError(result.error);
          }}
        >
          Move to {destination === "board" ? "Board" : "Backlog"}
        </button>
        <p className="mt-1 text-xs text-subtlest">
          Keeps its status and subtasks. Unsaved form changes will be discarded.
        </p>
        {error && (
          <p role="alert" className="mt-1 text-sm text-danger-text">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
