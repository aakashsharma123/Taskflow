"use client";
import { useId, useRef, useState, type FormEvent } from "react";
import { memberNameSchema } from "../schemas/workspace-settings-schema";
import type { SaveResult } from "@/features/tasks/store/task-store";
import { Avatar } from "@/shared/ui/avatar";
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
    <section aria-labelledby={`${id}-heading`} className="ui-panel p-5 sm:p-7">
      <h2 id={`${id}-heading`} className="ui-section-title">
        Team members
      </h2>
      <p className="mt-2 text-sm leading-6 text-subtle">
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
            className="ui-button ui-button-primary"
          >
            Add member
          </button>
        </div>
      </form>
      {members.length === 0 ? (
        <p className="mt-5 text-xs text-subtlest">
          No team members yet. Tasks can remain unassigned.
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-line">
          {members.map((name) => {
            const assigned = tasks.filter(
              (task) => task.assignee === name,
            ).length;
            return (
              <li key={name} className="py-4">
                <div className="flex items-center justify-between gap-3">
                  <Avatar name={name} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium [overflow-wrap:anywhere]">
                      {name}
                    </p>
                    <p className="mt-1 text-[11px] text-subtlest">
                      {assigned} {assigned === 1 ? "task" : "tasks"} assigned,
                      including archive and undo records
                    </p>
                  </div>
                  {confirm !== name && (
                    <button
                      type="button"
                      disabled={disabled}
                      className="ui-button ui-button-subtle ui-button-compact shrink-0"
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
                        className="ui-button ui-button-danger ui-button-compact"
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
                        className="ui-button ui-button-subtle ui-button-compact"
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
          className="mt-3 text-xs leading-6 text-danger-text"
        >
          {error}
        </p>
      )}
      <p role="status" className="mt-3 text-xs text-success-text">
        {notice}
      </p>
    </section>
  );
}
