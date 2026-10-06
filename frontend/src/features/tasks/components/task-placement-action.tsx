"use client";
import { useState } from "react";
import type { Task, TaskPlacement } from "@/features/tasks/schemas/types/task";
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
      className="mb-4 rounded-xl bg-base-200 p-4"
      aria-label="Task location"
    >
      <p className="text-xs leading-6">
        This task is in {task.placement === "board" ? "Board" : "Backlog"}.
        Moving it keeps its status and subtasks. Unsaved form changes will be
        discarded.
      </p>
      <button
        type="button"
        className="btn btn-outline btn-sm mt-3"
        onClick={() => {
          const result = onMove(destination);
          if (!result.ok) setError(result.error);
        }}
      >
        Move to {destination === "board" ? "Board" : "Backlog"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-xs text-rose-800">
          {error}
        </p>
      )}
    </section>
  );
}
