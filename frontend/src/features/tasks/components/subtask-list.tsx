"use client";

import { useId, useRef, useState } from "react";
import { subtaskTitleSchema } from "@/features/tasks/schemas/subtask-schema";
import type { Task } from "@/features/tasks/types/task";
import type { SaveResult } from "@/features/tasks/store/task-store";

type SubtaskListProps = {
  task: Task;
  onAdd: (taskId: number, title: string) => SaveResult;
  onToggle: (
    taskId: number,
    subtaskId: number,
    completed: boolean,
  ) => SaveResult;
};

export function SubtaskList({ task, onAdd, onToggle }: SubtaskListProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [fieldInvalid, setFieldInvalid] = useState(false);
  const [notice, setNotice] = useState("");
  const completed = task.subtasks.filter((subtask) => subtask.completed).length;

  function add() {
    const validated = subtaskTitleSchema.safeParse(title);
    if (!validated.success) {
      setError(validated.error.issues[0].message);
      setFieldInvalid(true);
      setNotice("");
      inputRef.current?.focus();
      return;
    }
    const result = onAdd(task.id, validated.data);
    setFieldInvalid(false);
    if (!result.ok) {
      setError(result.error);
      setNotice("");
      return;
    }
    setTitle("");
    setError("");
    setNotice("Subtask added and saved.");
    inputRef.current?.focus();
  }

  return (
    <section aria-labelledby={`${inputId}-heading`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 id={`${inputId}-heading`} className="text-base font-semibold">
          Subtasks
        </h3>
        <span className="text-xs text-subtle">
          {completed} of {task.subtasks.length} done
        </span>
      </div>
      {task.subtasks.length > 0 && (
        <progress
          aria-label="Subtasks done"
          className="progress mb-2 h-1.5 w-full text-icon-done"
          value={completed}
          max={task.subtasks.length}
        />
      )}
      <p className="mb-3 text-xs text-subtlest">
        Subtask changes save immediately. The parent task keeps its own status.
      </p>
      {task.subtasks.length > 0 ? (
        <ul className="mb-3 divide-y divide-line overflow-hidden rounded-xl border border-line">
          {task.subtasks.map((subtask) => (
            <li key={subtask.id}>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 px-3 py-2 hover:bg-raised-hover">
                <input
                  type="checkbox"
                  checked={subtask.completed}
                  className="checkbox checkbox-primary checkbox-sm shrink-0"
                  onChange={(event) => {
                    const result = onToggle(
                      task.id,
                      subtask.id,
                      event.target.checked,
                    );
                    setError(result.ok ? "" : result.error);
                    setFieldInvalid(false);
                    setNotice(result.ok ? "Subtask updated and saved." : "");
                  }}
                />
                <span
                  className={`min-w-0 [overflow-wrap:anywhere] ${subtask.completed ? "text-subtle line-through" : ""}`}
                >
                  {subtask.title}
                </span>
              </label>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-3 text-subtle">
          No subtasks yet. Break this task into smaller steps.
        </p>
      )}
      <label
        htmlFor={inputId}
        className="mb-1 block text-xs font-semibold text-subtle"
      >
        Subtask title
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          id={inputId}
          ref={inputRef}
          type="text"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setNotice("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
          aria-invalid={fieldInvalid}
          aria-describedby={fieldInvalid ? `${inputId}-error` : undefined}
          placeholder="e.g. Sketch the first layout"
          className="ui-field ui-field-compact flex-1"
        />
        <button type="button" onClick={add} className="ui-button">
          Add subtask
        </button>
      </div>
      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="mt-2 text-sm text-danger-text"
        >
          {error}
        </p>
      )}
      <p role="status" className="mt-2 text-xs text-success-text">
        {notice}
      </p>
    </section>
  );
}
