"use client";

import { useState } from "react";
import type { Task } from "@/features/tasks/types/task";
import type { SaveResult } from "@/features/workspace/store/workspace-store";

type Action = "archive" | "restore" | "delete";
export function TaskLifecycleActions({
  task,
  onAction,
}: {
  task: Task;
  onAction: (action: Action) => SaveResult;
}) {
  const [pending, setPending] = useState<Action | null>(null);
  const [error, setError] = useState("");
  return (
    <section
      aria-label="Task actions"
      className="mb-6 rounded-xl border border-base-300 p-4"
    >
      <h3 className="text-sm font-semibold">Task actions</h3>
      {pending ? (
        <div className="mt-3">
          <p className="text-xs leading-6">
            {pending === "delete"
              ? "Delete this task and its subtasks? You can undo this change afterward."
              : pending === "archive"
                ? "Archive this task? Its details will stay available in Archive."
                : "Restore this task to its previous location?"}
          </p>
          {pending === "archive" && task.sprintId !== null && (
            <p className="my-2 text-xs leading-6 text-base-content/65">
              Archiving removes this task from its sprint. You can assign it
              again after restoring.
            </p>
          )}
          <p className="text-xs text-base-content/60">
            Unsaved form changes will be discarded.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setPending(null);
                setError("");
              }}
            >
              Keep editing
            </button>
            <button
              type="button"
              className={`btn btn-sm ${pending === "delete" ? "btn-error" : "btn-primary"}`}
              onClick={() => {
                const result = onAction(pending);
                if (!result.ok) setError(result.error);
              }}
            >
              Confirm {pending}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setPending(task.archived ? "restore" : "archive")}
          >
            {task.archived ? "Restore task" : "Archive task"}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm text-rose-700"
            onClick={() => setPending("delete")}
          >
            Delete task
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-3 text-xs text-rose-800">
          {error}
        </p>
      )}
    </section>
  );
}
