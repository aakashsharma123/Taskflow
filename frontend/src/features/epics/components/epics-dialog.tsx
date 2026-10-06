"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { Dialog } from "@ark-ui/react/dialog";
import { EpicCollection } from "./epic-collection";
import { OrbitMark } from "@/shared/ui/orbit-mark";
import { DialogPanel } from "@/shared/ui/dialog-panel";
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
  const [name, setName] = useState("");

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
    setName("");
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
        setName("");
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
        kind="epics"
        description="Connect the small steps to your bigger picture."
      >
        <div className="min-h-0 overflow-y-auto overscroll-contain">
          <div className="grid md:grid-cols-[minmax(0,1fr)_300px]">
            <aside
              aria-label="New epic"
              className="min-w-0 border-b border-base-300/70 bg-workspace/70 px-5 py-6 sm:px-7 md:order-2 md:border-b-0 md:border-l"
            >
              <span
                aria-hidden="true"
                className="mb-5 flex size-14 items-center justify-center rounded-2xl border border-secondary/50 bg-secondary/25 text-primary"
              >
                <OrbitMark className="size-9" />
              </span>
              <h3 className="text-lg font-semibold tracking-tight">
                A bigger goal starts here.
              </h3>
              <p className="mt-3 mb-6 text-xs leading-6 text-base-content/65">
                Give related tasks a shared purpose. Create an epic, then
                connect your tasks as you plan.
              </p>
              <form aria-label="Create epic" noValidate onSubmit={handleSubmit}>
                <label
                  htmlFor={inputId}
                  className="mb-2 block text-xs font-semibold"
                >
                  Epic name
                </label>
                <input
                  id={inputId}
                  ref={nameRef}
                  name="name"
                  type="text"
                  value={name}
                  aria-invalid={invalid}
                  aria-describedby={
                    invalid ? `${inputId}-error` : `${inputId}-hint`
                  }
                  placeholder="e.g. Customer onboarding"
                  className="input composer-control h-12 w-full min-w-0 rounded-xl border-base-300/80 bg-base-100 text-xs"
                  onChange={(event) => {
                    setName(event.target.value);
                    setNotice("");
                    setError("");
                    setInvalid(false);
                  }}
                />
                <p
                  id={`${inputId}-hint`}
                  className="mt-2 text-[10px] leading-5 text-base-content/65"
                >
                  Keep it short and specific · Up to 60 characters.
                </p>
                {error && (
                  <p
                    id={`${inputId}-error`}
                    role="alert"
                    className="mt-3 rounded-xl bg-rose-50 p-3 text-xs leading-6 text-rose-800"
                  >
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  className="btn btn-primary mt-5 h-11 w-full rounded-xl text-xs shadow-none"
                >
                  <span aria-hidden="true" className="text-lg font-normal">
                    +
                  </span>
                  Create epic
                </button>
                <p
                  role="status"
                  className="mt-3 text-xs leading-6 text-teal-800"
                >
                  {notice}
                </p>
              </form>
              <div className="mt-7 border-t border-base-300/70 pt-5">
                <p className="mb-3 text-[10px] font-semibold tracking-[0.15em] text-base-content/65 uppercase">
                  Preview
                </p>
                <div className="rounded-2xl border border-base-300/80 bg-base-100 p-4 shadow-sm">
                  <div className="mb-4 flex items-center gap-2 text-[10px] font-medium text-base-content/65">
                    <OrbitMark className="size-4 text-base-content/65" />
                    Epic
                  </div>
                  <p
                    className={`text-sm leading-6 font-semibold [overflow-wrap:anywhere] ${name.trim() ? "" : "text-base-content/65"}`}
                  >
                    {name.trim() || "Your next big goal"}
                  </p>
                  <p className="mt-3 text-[10px] text-base-content/65">
                    Ready for its first task
                  </p>
                </div>
              </div>
            </aside>
            <div className="min-w-0 px-5 py-6 sm:px-7 sm:py-7 md:order-1">
              <EpicCollection epics={epics} tasks={tasks} />
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-base-300/70 bg-base-100 px-5 py-4 sm:px-7">
          <p className="text-[10px] leading-5 text-base-content/65">
            One goal. A clearer path forward.
          </p>
          <Dialog.CloseTrigger asChild>
            <button
              type="button"
              className="btn btn-primary h-11 rounded-xl px-6 text-xs shadow-none"
            >
              Done
            </button>
          </Dialog.CloseTrigger>
        </div>
      </DialogPanel>
    </Dialog.Root>
  );
}
