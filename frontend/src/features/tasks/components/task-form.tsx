"use client";

import {
  useId,
  useState,
  type FormEvent,
  type RefObject,
  type ReactNode,
} from "react";
import { z } from "zod";
import { Dialog } from "@ark-ui/react/dialog";
import {
  createTaskSchema,
  type CreateTaskFieldErrors,
  type CreateTaskInput,
} from "@/features/tasks/schemas/create-task-schema";
import type { SaveResult } from "@/features/tasks/store/task-store";

type TaskFormProps = {
  epics: string[];
  assignees: string[];
  initialValues?: CreateTaskInput;
  titleRef: RefObject<HTMLInputElement | null>;
  submitLabel: string;
  onSave: (input: CreateTaskInput) => SaveResult;
  children?: ReactNode;
};

function FieldError({
  id,
  errors,
}: {
  id: string;
  errors: string[] | undefined;
}) {
  if (!errors?.length) return null;
  return (
    <p id={id} className="text-xs leading-5 font-normal text-rose-800">
      {errors[0]}
    </p>
  );
}

export function TaskForm({
  epics,
  assignees,
  initialValues,
  titleRef,
  submitLabel,
  onSave,
  children,
}: TaskFormProps) {
  const fieldId = useId();
  const [errors, setErrors] = useState<CreateTaskFieldErrors>({});
  const [saveError, setSaveError] = useState("");
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const result = createTaskSchema({ epics, assignees }).safeParse({
      title: values.get("title"),
      description: values.get("description"),
      status: values.get("status"),
      priority: values.get("priority"),
      epic: values.get("epic"),
      assignee: values.get("assignee"),
    });

    if (!result.success) {
      const fieldErrors = z.flattenError(result.error).fieldErrors;
      setErrors(fieldErrors);
      setSaveError("");
      const firstInvalidField = Object.keys(fieldErrors)[0];
      const control = firstInvalidField
        ? form.elements.namedItem(firstInvalidField)
        : null;
      if (control instanceof HTMLElement) control.focus();
      return;
    }

    setErrors({});
    const saved = onSave(result.data);
    if (!saved.ok) {
      setSaveError(saved.error);
      return;
    }
    setSaveError("");
  }

  return (
    <form
      className="flex min-h-0 flex-col"
      aria-label="Task details form"
      noValidate
      onSubmit={handleSubmit}
      onChange={() => setSaveError("")}
    >
      <div className="space-y-5 overflow-y-auto px-6 py-5">
        <div className="flex flex-col gap-2 text-xs font-medium">
          <label htmlFor={`${fieldId}-title`}>Task title</label>
          <input
            id={`${fieldId}-title`}
            ref={titleRef}
            name="title"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={
              errors.title ? `${fieldId}-title-error` : undefined
            }
            defaultValue={initialValues?.title ?? ""}
            type="text"
            className="input h-11 w-full rounded-xl border-base-300 text-sm font-normal"
            placeholder="e.g. Design the project overview"
          />
          <FieldError id={`${fieldId}-title-error`} errors={errors.title} />
        </div>
        <div className="flex flex-col gap-2 text-xs font-medium">
          <label htmlFor={`${fieldId}-description`}>Description</label>
          <textarea
            id={`${fieldId}-description`}
            name="description"
            rows={4}
            defaultValue={initialValues?.description ?? ""}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={
              errors.description
                ? `${fieldId}-description-error`
                : `${fieldId}-description-hint`
            }
            className="textarea w-full resize-y rounded-xl border-base-300 text-sm font-normal"
            placeholder="Add context, acceptance criteria, or helpful notes…"
          />
          <p
            id={`${fieldId}-description-hint`}
            className="font-normal text-base-content/60"
          >
            Optional · Plain text · Up to 5,000 characters.
          </p>
          <FieldError
            id={`${fieldId}-description-error`}
            errors={errors.description}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-2 text-xs font-medium">
            <label htmlFor={`${fieldId}-status`}>Status</label>
            <select
              id={`${fieldId}-status`}
              name="status"
              aria-invalid={Boolean(errors.status)}
              aria-describedby={
                errors.status ? `${fieldId}-status-error` : undefined
              }
              defaultValue={initialValues?.status ?? "todo"}
              className="select h-11 w-full rounded-xl border-base-300 text-sm font-normal"
            >
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="in_review">In review</option>
              <option value="done">Done</option>
            </select>
            <FieldError id={`${fieldId}-status-error`} errors={errors.status} />
          </div>
          <div className="flex min-w-0 flex-col gap-2 text-xs font-medium">
            <label htmlFor={`${fieldId}-priority`}>Priority</label>
            <select
              id={`${fieldId}-priority`}
              name="priority"
              aria-invalid={Boolean(errors.priority)}
              aria-describedby={
                errors.priority ? `${fieldId}-priority-error` : undefined
              }
              defaultValue={initialValues?.priority ?? "medium"}
              className="select h-11 w-full rounded-xl border-base-300 text-sm font-normal"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <FieldError
              id={`${fieldId}-priority-error`}
              errors={errors.priority}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-2 text-xs font-medium">
            <label htmlFor={`${fieldId}-epic`}>Epic</label>
            <select
              id={`${fieldId}-epic`}
              name="epic"
              aria-invalid={Boolean(errors.epic)}
              aria-describedby={
                errors.epic ? `${fieldId}-epic-error` : undefined
              }
              defaultValue={initialValues?.epic ?? ""}
              className="select h-11 w-full rounded-xl border-base-300 text-sm font-normal"
            >
              <option value="">No epic</option>
              {epics.map((epic) => (
                <option key={epic} value={epic}>
                  {epic}
                </option>
              ))}
            </select>
            <FieldError id={`${fieldId}-epic-error`} errors={errors.epic} />
          </div>
          <div className="flex min-w-0 flex-col gap-2 text-xs font-medium">
            <label htmlFor={`${fieldId}-assignee`}>Assignee</label>
            <select
              id={`${fieldId}-assignee`}
              name="assignee"
              aria-invalid={Boolean(errors.assignee)}
              aria-describedby={
                errors.assignee ? `${fieldId}-assignee-error` : undefined
              }
              defaultValue={initialValues?.assignee ?? ""}
              className="select h-11 w-full rounded-xl border-base-300 text-sm font-normal"
            >
              <option value="">Unassigned</option>
              {assignees.map((assignee) => (
                <option key={assignee} value={assignee}>
                  {assignee}
                </option>
              ))}
            </select>
            <FieldError
              id={`${fieldId}-assignee-error`}
              errors={errors.assignee}
            />
          </div>
        </div>
        {children}
        {Object.keys(errors).length > 0 && (
          <p role="alert" className="text-xs leading-6 text-rose-800">
            Review the highlighted fields, then check again.
          </p>
        )}
        {saveError && (
          <p
            role="alert"
            className="rounded-xl bg-rose-50 px-3 py-2.5 text-xs leading-6 text-rose-800"
          >
            {saveError}
          </p>
        )}
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
          className="btn btn-primary h-11 rounded-xl text-xs"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
