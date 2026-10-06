"use client";

import { useWorkspace } from "@/features/workspace/components/workspace-provider";
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
  const { renameSubtask, deleteSubtask } = useWorkspace();
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [removing, setRemoving] = useState<number | null>(null);
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
    <section
      aria-labelledby={`${inputId}-heading`}
      className="rounded-2xl border border-base-300/80 bg-workspace p-4"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 id={`${inputId}-heading`} className="text-sm font-semibold">
          Subtasks
        </h3>
        <span className="text-[11px] font-medium text-base-content/75">
          {completed} of {task.subtasks.length} done
        </span>
      </div>
      <p className="mb-4 text-[11px] leading-5 text-base-content/70">
        Subtask changes save immediately. The parent task keeps its own status.
      </p>
      {task.subtasks.length > 0 ? (
        <ul className="mb-4 space-y-2">
          {task.subtasks.map((subtask) => (
            <li
              key={subtask.id}
              className="rounded-xl border border-base-300/60 bg-base-100 px-3 py-2"
            >
              {editing === subtask.id ? (
                <div>
                  <label className="text-xs font-medium">
                    Edit subtask
                    <input
                      autoFocus
                      value={draft}
                      maxLength={120}
                      onChange={(event) => {
                        setDraft(event.target.value);
                        setError("");
                      }}
                      className="input mt-2 w-full rounded-xl"
                    />
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        const result = renameSubtask(
                          task.id,
                          subtask.id,
                          draft,
                        );
                        setError(result.ok ? "" : result.error);
                        if (result.ok) {
                          setEditing(null);
                          setNotice("Subtask renamed.");
                          inputRef.current?.focus();
                        }
                      }}
                    >
                      Save subtask
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setEditing(null);
                        inputRef.current?.focus();
                      }}
                    >
                      Cancel edit
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <label className="flex min-h-8 cursor-pointer items-center gap-3 text-xs leading-5">
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
                        setNotice(
                          result.ok ? "Subtask updated and saved." : "",
                        );
                      }}
                    />
                    <span
                      className={`min-w-0 [overflow-wrap:anywhere] ${subtask.completed ? "text-base-content/65 line-through" : "text-base-content"}`}
                    >
                      {subtask.title}
                    </span>
                  </label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {removing === subtask.id ? (
                      <>
                        <p className="w-full text-[11px] leading-6">
                          Remove this subtask?
                        </p>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm text-xs"
                          onClick={() => setRemoving(null)}
                        >
                          Keep subtask
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm text-xs text-rose-800"
                          onClick={() => {
                            const result = deleteSubtask(task.id, subtask.id);
                            setError(result.ok ? "" : result.error);
                            if (result.ok) {
                              setRemoving(null);
                              setNotice("Subtask removed.");
                              inputRef.current?.focus();
                            }
                          }}
                        >
                          Confirm removal
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm text-[11px]"
                          onClick={() => {
                            setEditing(subtask.id);
                            setDraft(subtask.title);
                            setError("");
                          }}
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm text-[11px]"
                          onClick={() => setRemoving(subtask.id)}
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-4 text-xs leading-6 text-base-content/70">
          No subtasks yet. Break this task into smaller steps.
        </p>
      )}
      <label htmlFor={inputId} className="mb-2 block text-xs font-medium">
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
            setFieldInvalid(false);
            setError("");
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
          className="input h-11 min-w-0 flex-1 rounded-xl border-base-300 bg-base-100 text-xs"
        />
        <button
          type="button"
          onClick={add}
          className="btn btn-primary h-11 rounded-xl text-xs"
        >
          Add subtask
        </button>
      </div>
      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="mt-2 text-xs leading-6 text-rose-800"
        >
          {error}
        </p>
      )}
      <p role="status" className="mt-2 text-[11px] leading-5 text-teal-800">
        {notice}
      </p>
    </section>
  );
}
