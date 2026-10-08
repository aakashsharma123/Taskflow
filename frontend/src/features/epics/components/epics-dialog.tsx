"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { Dialog } from "@ark-ui/react/dialog";
import { DialogPanel } from "@/shared/ui/dialog-panel";
import { createEpicSchema } from "@/features/epics/schemas/create-epic-schema";
import type { Task } from "@/features/tasks/schemas/types/task";
import type { SaveResult } from "@/features/tasks/store/task-store";

type EpicsDialogProps = {
  epics: string[];
  tasks: Task[];
  disabled?: boolean;
  onCreate: (name: string) => SaveResult;
};

export function EpicsDialog({
  epics,
  tasks,
  disabled,
  onCreate,
}: EpicsDialogProps) {
  const nameRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [invalid, setInvalid] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const validated = createEpicSchema(epics).safeParse(
      new FormData(form).get("name"),
    );
    if (!validated.success) {
      setError(validated.error.issues[0].message);
      setInvalid(true);
      setNotice("");
      nameRef.current?.focus();
      return;
    }
    const result = onCreate(validated.data);
    setInvalid(false);
    if (!result.ok) {
      setError(result.error);
      setNotice("");
      return;
    }
    form.reset();
    setError("");
    setNotice(
      `Epic “${validated.data}” created. Choose it when creating or editing a task.`,
    );
    nameRef.current?.focus();
  }

  return (
    <Dialog.Root
      initialFocusEl={() => nameRef.current}
      onOpenChange={() => {
        setError("");
        setInvalid(false);
        setNotice("");
      }}
      closeOnInteractOutside={false}
      lazyMount
      unmountOnExit
    >
      <Dialog.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="btn btn-outline h-10 rounded-xl border-base-300 text-xs"
        >
          Epics
        </button>
      </Dialog.Trigger>
      <DialogPanel
        title="Epics"
        description="Group related tasks around a larger goal."
      >
        <div className="min-h-0 space-y-5 overflow-y-auto px-6 py-5">
          <form
            aria-label="Create epic"
            noValidate
            onSubmit={handleSubmit}
            className="rounded-2xl border border-base-300/70 bg-workspace p-4"
          >
            <label htmlFor={inputId} className="mb-2 block text-xs font-medium">
              Epic name
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                id={inputId}
                ref={nameRef}
                name="name"
                type="text"
                aria-invalid={invalid}
                aria-describedby={invalid ? `${inputId}-error` : undefined}
                placeholder="e.g. Customer onboarding"
                className="input h-11 min-w-0 flex-1 rounded-xl border-base-300 bg-base-100 text-xs"
                onChange={() => setNotice("")}
              />
              <button
                type="submit"
                className="btn btn-primary h-11 rounded-xl text-xs"
              >
                Create epic
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
            <p role="status" className="mt-2 text-xs leading-6 text-teal-800">
              {notice}
            </p>
          </form>
          <div>
            <h3 className="mb-3 text-[11px] font-semibold tracking-wide text-base-content/70 uppercase">
              Project epics · {epics.length}
            </h3>
            {epics.length ? (
              <ul className="space-y-3">
                {epics.map((name) => {
                  const items = tasks.filter((task) => task.epic === name);
                  const completed = items.filter(
                    (task) => task.status === "done",
                  ).length;
                  return (
                    <li
                      key={name}
                      className="rounded-2xl border border-base-300/80 p-4"
                    >
                      <p className="mb-2 text-sm font-semibold [overflow-wrap:anywhere]">
                        {name}
                      </p>
                      <div className="mb-2 flex justify-between gap-3 text-[11px] text-base-content/75">
                        <span>
                          {items.length} {items.length === 1 ? "task" : "tasks"}
                        </span>
                        <span>{completed} completed</span>
                      </div>
                      <progress
                        className="progress progress-primary h-1.5 w-full"
                        aria-label={`${name} completed tasks`}
                        max={Math.max(items.length, 1)}
                        value={completed}
                      />
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-xs text-base-content/70">
                Create your first epic to group related work.
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 justify-end border-t border-base-300/70 px-6 py-4">
          <Dialog.CloseTrigger asChild>
            <button
              type="button"
              className="btn btn-primary h-11 rounded-xl text-xs"
            >
              Done
            </button>
          </Dialog.CloseTrigger>
        </div>
      </DialogPanel>
    </Dialog.Root>
  );
}
