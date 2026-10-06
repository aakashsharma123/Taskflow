"use client";

import { useId, useRef } from "react";
import { Dialog } from "@ark-ui/react/dialog";
import { Portal } from "@ark-ui/react/portal";

type CreateTaskDialogProps = {
  epics: string[];
  assignees: string[];
};

export function CreateTaskDialog({ epics, assignees }: CreateTaskDialogProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const previewNoteId = useId();
  const fieldId = useId();

  return (
    <Dialog.Root
      initialFocusEl={() => titleRef.current}
      closeOnInteractOutside={false}
      lazyMount
      unmountOnExit
    >
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="btn btn-primary h-10 rounded-xl px-4 text-xs"
        >
          <span aria-hidden="true" className="text-lg font-normal">
            +
          </span>
          New task
        </button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-primary/45 backdrop-blur-sm" />
        <Dialog.Positioner className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Content className="flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-base-300 bg-base-100 text-base-content shadow-2xl outline-none">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-base-300/70 bg-workspace px-6 py-5">
              <div>
                <p className="mb-2 flex items-center gap-2 text-[10px] font-medium tracking-widest text-base-content/70 uppercase">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-5 rounded-full bg-secondary"
                  />
                  Orbit / Board
                </p>
                <Dialog.Title className="text-xl font-semibold tracking-tight">
                  New task
                </Dialog.Title>
                <Dialog.Description className="mt-2 text-xs leading-6 text-base-content/75">
                  Give your next piece of work a clear place to start.
                </Dialog.Description>
              </div>
              <Dialog.CloseTrigger asChild>
                <button
                  type="button"
                  aria-label="Close new task"
                  className="btn btn-ghost size-11 shrink-0 rounded-full p-0"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="size-5"
                  >
                    <path d="m6 6 12 12M18 6 6 18" />
                  </svg>
                </button>
              </Dialog.CloseTrigger>
            </div>
            <form
              className="flex min-h-0 flex-col"
              aria-label="New task details"
              onSubmit={(event) => event.preventDefault()}
            >
              <div className="space-y-5 overflow-y-auto px-6 py-5">
                <label className="flex flex-col gap-2 text-xs font-medium">
                  Task title
                  <input
                    ref={titleRef}
                    name="title"
                    type="text"
                    className="input h-11 w-full rounded-xl border-base-300 text-sm font-normal"
                    placeholder="e.g. Design the project overview"
                  />
                </label>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="flex min-w-0 flex-col gap-2 text-xs font-medium">
                    <label htmlFor={`${fieldId}-status`}>Status</label>
                    <select
                      id={`${fieldId}-status`}
                      name="status"
                      defaultValue="todo"
                      className="select h-11 w-full rounded-xl border-base-300 text-sm font-normal"
                    >
                      <option value="todo">To do</option>
                      <option value="in_progress">In progress</option>
                      <option value="in_review">In review</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                  <div className="flex min-w-0 flex-col gap-2 text-xs font-medium">
                    <label htmlFor={`${fieldId}-priority`}>Priority</label>
                    <select
                      id={`${fieldId}-priority`}
                      name="priority"
                      defaultValue="medium"
                      className="select h-11 w-full rounded-xl border-base-300 text-sm font-normal"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="flex min-w-0 flex-col gap-2 text-xs font-medium">
                    <label htmlFor={`${fieldId}-epic`}>Epic</label>
                    <select
                      id={`${fieldId}-epic`}
                      name="epic"
                      defaultValue=""
                      className="select h-11 w-full rounded-xl border-base-300 text-sm font-normal"
                    >
                      <option value="">No epic</option>
                      {epics.map((epic) => (
                        <option key={epic} value={epic}>
                          {epic}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex min-w-0 flex-col gap-2 text-xs font-medium">
                    <label htmlFor={`${fieldId}-assignee`}>Assignee</label>
                    <select
                      id={`${fieldId}-assignee`}
                      name="assignee"
                      defaultValue=""
                      className="select h-11 w-full rounded-xl border-base-300 text-sm font-normal"
                    >
                      <option value="">Unassigned</option>
                      {assignees.map((assignee) => (
                        <option key={assignee} value={assignee}>
                          {assignee}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p
                  id={previewNoteId}
                  className="rounded-xl bg-workspace px-3 py-2.5 text-xs leading-6 text-base-content/75"
                >
                  Preview only. Tasks cannot be saved yet.
                </p>
              </div>
              <div className="flex shrink-0 justify-end gap-3 border-t border-base-300/70 px-6 py-4">
                <Dialog.CloseTrigger asChild>
                  <button
                    type="button"
                    className="btn btn-ghost h-11 rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                </Dialog.CloseTrigger>
                <button
                  type="submit"
                  disabled
                  aria-describedby={previewNoteId}
                  className="btn btn-primary h-11 rounded-xl text-xs"
                >
                  Create task
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
