"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { Dialog } from "@ark-ui/react/dialog";
import { EpicCollection } from "./epic-collection";
import { DialogPanel } from "@/shared/ui/dialog-panel";
import { EpicIcon } from "@/features/tasks/components/task-icons";
import { createEpicSchema } from "@/features/epics/schemas/create-epic-schema";
import type { Task } from "@/features/tasks/types/task";
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
        <button type="button" disabled={disabled} className="ui-button">
          <EpicIcon />
          Epics
        </button>
      </Dialog.Trigger>
      <DialogPanel
        title="Epics"
        description="Group related tasks around a larger goal."
      >
        <div className="min-h-0 space-y-6 overflow-y-auto px-6 pt-1 pb-6">
          <form aria-label="Create epic" noValidate onSubmit={handleSubmit}>
            <label
              htmlFor={inputId}
              className="mb-1 block text-xs font-semibold text-subtle"
            >
              Epic name
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                id={inputId}
                ref={nameRef}
                name="name"
                type="text"
                aria-invalid={invalid}
                aria-describedby={
                  invalid ? `${inputId}-error` : `${inputId}-hint`
                }
                placeholder="e.g. Customer onboarding"
                className="ui-field flex-1"
                onChange={() => {
                  setNotice("");
                  setError("");
                  setInvalid(false);
                }}
              />
              <button
                type="submit"
                className="ui-button ui-button-primary self-center"
              >
                Create epic
              </button>
            </div>
            <p id={`${inputId}-hint`} className="mt-1 text-xs text-subtlest">
              Keep it short and specific · Up to 60 characters.
            </p>
            {error && (
              <p
                id={`${inputId}-error`}
                role="alert"
                className="mt-2 text-sm text-danger-text"
              >
                {error}
              </p>
            )}
            <p role="status" className="mt-2 text-sm text-success-text">
              {notice}
            </p>
          </form>
          <EpicCollection epics={epics} tasks={tasks} />
        </div>
        <div className="flex shrink-0 justify-end border-t border-line px-6 py-4">
          <Dialog.CloseTrigger asChild>
            <button type="button" className="ui-button ui-button-primary">
              Done
            </button>
          </Dialog.CloseTrigger>
        </div>
      </DialogPanel>
    </Dialog.Root>
  );
}
