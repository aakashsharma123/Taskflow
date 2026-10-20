"use client";
import { useId, useRef, useState, type FormEvent } from "react";
import { memberNameSchema } from "../schemas/workspace-settings-schema";
import type { SaveResult } from "@/features/tasks/store/task-store";
import type { Task } from "@/features/tasks/types/task";
export function TeamMembers({
  members,
  tasks,
  disabled,
  onAdd,
  onRemove,
}: {
  members: string[];
  tasks: Task[];
  disabled: boolean;
  onAdd: (name: string) => SaveResult;
  onRemove: (name: string) => SaveResult;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [fieldInvalid, setFieldInvalid] = useState(false);
  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const parsed = memberNameSchema.safeParse(
      String(new FormData(form).get("member") ?? ""),
    );
    if (!parsed.success) {
      setFieldInvalid(true);
      setError(parsed.error.issues[0].message);
      setNotice("");
      inputRef.current?.focus();
      return;
    }
    setFieldInvalid(false);
    const result = onAdd(parsed.data);
    setError(result.ok ? "" : result.error);
    setNotice(result.ok ? "Member added to the assignee list." : "");
    if (result.ok) form.reset();
    inputRef.current?.focus();
  }
  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="rounded-2xl border border-base-300/80 bg-base-100 p-5 sm:p-6"
    >
      <h2 id={`${id}-heading`} className="text-lg font-semibold">
        Team members
      </h2>
      <p className="mt-2 text-xs leading-6 text-base-content/65">
        Manage the names available in task assignments. Up to 50 local members.
      </p>
      <form aria-label="Add team member" onSubmit={add} className="mt-5">
        <label htmlFor={`${id}-name`} className="text-xs font-medium">
          Member name
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            ref={inputRef}
            id={`${id}-name`}
            name="member"
            aria-invalid={fieldInvalid}
            aria-describedby={fieldInvalid ? `${id}-error` : undefined}
            type="text"
            disabled={disabled}
            className="ui-field flex-1"
            placeholder="e.g. Alex Rivera"
          />
          <button
            type="submit"
            disabled={disabled}
            className="btn btn-primary rounded-xl text-xs"
          >
            Add member
          </button>
        </div>
      </form>
      {members.length === 0 ? (
        <p className="mt-5 text-xs text-base-content/60">
          No team members yet. Tasks can remain unassigned.
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-base-300/70">
          {members.map((name) => {
            const assigned = tasks.filter(
              (task) => task.assignee === name,
            ).length;
            return (
              <li key={name} className="py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold [overflow-wrap:anywhere]">
                      {name}
                    </p>
                    <p className="mt-1 text-[11px] text-base-content/60">
                      {assigned} {assigned === 1 ? "task" : "tasks"} assigned,
                      including archive and undo records
                    </p>
                  </div>
                  {confirm !== name && (
                    <button
                      type="button"
                      disabled={disabled}
                      className="btn btn-ghost btn-sm shrink-0 text-xs"
                      aria-label={`Remove ${name}`}
                      onClick={() => {
                        setConfirm(name);
                        setError("");
                        setFieldInvalid(false);
                        requestAnimationFrame(() =>
                          document.getElementById(`${id}-confirm`)?.focus(),
                        );
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                {confirm === name && (
                  <div className="mt-3 rounded-xl border border-secondary bg-sunken p-3">
                    <p className="text-xs leading-6">
                      Remove {name}? Their {assigned} assigned tasks will become
                      unassigned.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        id={`${id}-confirm`}
                        type="button"
                        disabled={disabled}
                        className="btn btn-primary btn-sm text-xs"
                        onClick={() => {
                          const result = onRemove(name);
                          setError(result.ok ? "" : result.error);
                          if (result.ok) {
                            setConfirm(null);
                            setNotice(
                              `${name} removed. Tasks are now unassigned.`,
                            );
                            inputRef.current?.focus();
                          }
                        }}
                      >
                        Confirm removal
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm text-xs"
                        onClick={() => {
                          setConfirm(null);
                          inputRef.current?.focus();
                        }}
                      >
                        Keep member
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-3 text-xs leading-6 text-rose-800"
        >
          {error}
        </p>
      )}
      <p role="status" className="mt-3 text-xs text-teal-800">
        {notice}
      </p>
    </section>
  );
}
