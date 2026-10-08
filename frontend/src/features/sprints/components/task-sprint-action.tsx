"use client";
import { useId, useState } from "react";
import type { Task } from "@/features/tasks/types/task";
import type { SaveResult } from "@/features/workspace/store/workspace-store";
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
    <section className="border-t border-base-300/70 pt-5">
      <h3 className="text-sm font-semibold">Sprint</h3>
      {current?.status === "completed" ? (
        <p className="mt-2 text-xs leading-6">
          Completed in {current.name}. Reopen the task to plan it again.
        </p>
      ) : (
        <>
          <p className="my-2 text-[11px] leading-5 text-base-content/60">
            Apply saves immediately and closes this panel. Unsaved form edits
            are discarded. Active sprint tasks move to Board.
          </p>
          <label htmlFor={fieldId} className="text-xs font-medium">
            Task sprint
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            <select
              id={fieldId}
              className="select min-w-0 flex-1 rounded-xl border-base-300 text-xs"
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
              className="btn btn-outline rounded-xl text-xs"
              onClick={() => {
                const result = onAssign(value ? Number(value) : null);
                setError(result.ok ? "" : result.error);
              }}
            >
              Apply sprint
            </button>
          </div>
        </>
      )}
      {error && (
        <p role="alert" className="mt-2 text-xs text-rose-800">
          {error}
        </p>
      )}
    </section>
  );
}
