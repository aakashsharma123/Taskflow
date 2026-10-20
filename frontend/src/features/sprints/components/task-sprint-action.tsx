"use client";
import { useId, useState } from "react";
import type { Task } from "@/features/tasks/types/task";
import type { SaveResult } from "@/features/tasks/store/task-store";
import type { Sprint } from "../types/sprint";
export function TaskSprintAction({
  task,
  sprints,
  onAssign,
}: {
  task: Task;
  sprints: Sprint[];
  onAssign: (id: number | null) => SaveResult;
}) {
  const fieldId = useId();
  const [error, setError] = useState("");
  const current = sprints.find((sprint) => sprint.id === task.sprintId);
  const [value, setValue] = useState(String(task.sprintId ?? ""));
  if (task.archived) return null;
  return (
    <section
      aria-label="Sprint"
      className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-start gap-x-3"
    >
      {current?.status === "completed" ? (
        <>
          <span className="pt-1.5 text-sm font-medium text-subtle">Sprint</span>
          <p className="min-w-0 pt-1.5">
            Completed in {current.name}. Reopen the task to plan it again.
          </p>
        </>
      ) : (
        <>
          <label
            htmlFor={fieldId}
            className="pt-1.5 text-sm font-medium text-subtle"
          >
            Sprint
          </label>
          <div className="min-w-0">
            <div className="flex gap-1">
              <select
                id={fieldId}
                className="ui-field ui-field-subtle ui-field-compact"
                value={value}
                onChange={(event) => setValue(event.target.value)}
              >
                <option value="">No sprint</option>
                {sprints
                  .filter((sprint) => sprint.status !== "completed")
                  .map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name} · {sprint.status}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                className="ui-button ui-button-compact self-center"
                onClick={() => {
                  const result = onAssign(value ? Number(value) : null);
                  setError(result.ok ? "" : result.error);
                }}
              >
                Apply<span className="sr-only"> sprint</span>
              </button>
            </div>
            <p className="mt-1 text-xs text-subtlest">
              Apply saves immediately and closes this panel. Unsaved form edits
              are discarded. Active sprint tasks move to Board.
            </p>
          </div>
        </>
      )}
      {error && (
        <p role="alert" className="col-start-2 mt-1 text-sm text-danger-text">
          {error}
        </p>
      )}
    </section>
  );
}
