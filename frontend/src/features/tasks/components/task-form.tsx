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
import { TaskLabel } from "./task-metadata";
import type { SaveResult } from "@/features/workspace/store/workspace-store";

type TaskFormProps = {
  epics: string[];
  assignees: string[];
  initialValues?: CreateTaskInput;
  defaultEpic?: string;
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
  defaultEpic,
  titleRef,
  submitLabel,
  onSave,
  children,
}: TaskFormProps) {
  const fieldId = useId();
  const [errors, setErrors] = useState<CreateTaskFieldErrors>({});
  const [saveError, setSaveError] = useState("");
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );
  const [labels, setLabels] = useState(initialValues?.labels.join(", ") ?? "");
  const labelPreview = [
    ...new Set(
      labels
        .split(",")
        .map((label) => label.trim())
        .filter(Boolean),
    ),
  ].slice(0, 5);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const result = createTaskSchema({ epics, assignees }).safeParse({
      title: values.get("title"),
      description: values.get("description"),
      labels: String(values.get("labels") ?? "")
        .split(",")
        .map((label) => label.trim())
        .filter(Boolean),
      dueDate: values.get("dueDate") || null,
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
      onChange={(event) => {
        setSaveError("");
        const control = event.target;
        if (!(
          control instanceof HTMLInputElement ||
          control instanceof HTMLTextAreaElement ||
          control instanceof HTMLSelectElement
        ))
          return;
        const field = control.name as keyof CreateTaskInput;
        setErrors((current) => {
          if (!current[field]) return current;
          const next = { ...current };
          delete next[field];
          return next;
        });
      }}
    >
      <div className="min-h-0 overflow-y-auto overscroll-contain">
        <div className="grid md:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 space-y-6 px-5 py-6 sm:px-7 sm:py-7">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor={`${fieldId}-title`}
                  className="text-xs font-semibold"
                >
                  Task title
                </label>
                <span className="text-[10px] text-base-content/65">
                  Required
                </span>
              </div>
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
                className="input composer-control h-14 w-full rounded-xl border-base-300/80 bg-base-200/25 px-4 text-base font-medium placeholder:font-normal sm:text-lg"
                placeholder="What needs to be done?"
              />
              <FieldError id={`${fieldId}-title-error`} errors={errors.title} />
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor={`${fieldId}-description`}
                  className="text-xs font-semibold"
                >
                  Description
                </label>
                <span className="text-[10px] text-base-content/65">
                  Optional
                </span>
              </div>
              <div className="overflow-hidden rounded-2xl border border-base-300/80 bg-base-100 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15">
                <textarea
                  id={`${fieldId}-description`}
                  name="description"
                  rows={8}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  aria-invalid={Boolean(errors.description)}
                  aria-describedby={
                    errors.description
                      ? `${fieldId}-description-error`
                      : `${fieldId}-description-hint`
                  }
                  className="textarea composer-control block h-44 min-h-36 w-full resize-y sm:h-64 rounded-none border-0 bg-transparent p-4 text-sm leading-7"
                  placeholder={
                    "Give your team a little context…\n\nWhat’s the goal? What does done look like?"
                  }
                />
                <div className="flex flex-wrap justify-between gap-2 border-t border-base-300/60 bg-base-200/25 px-4 py-3 text-[10px] text-base-content/65">
                  <span id={`${fieldId}-description-hint`}>
                    Context, notes & acceptance criteria · Plain text
                  </span>
                  <span
                    aria-hidden="true"
                    className={description.length > 5000 ? "text-rose-800" : ""}
                  >
                    {description.length.toLocaleString()} / 5,000
                  </span>
                </div>
              </div>
              <FieldError
                id={`${fieldId}-description-error`}
                errors={errors.description}
              />
            </div>
            {!initialValues && (
              <div className="hidden items-start gap-3 rounded-2xl border border-secondary/40 bg-secondary/10 p-4 md:flex">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="mt-0.5 size-5 shrink-0 text-base-content/65"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="m8 12 3 3 5-6" />
                </svg>
                <p className="text-xs leading-6 text-base-content/65">
                  Start with a clear title. You can add more detail, subtasks,
                  and a sprint as the work takes shape.
                </p>
              </div>
            )}
          </div>
          <aside
            aria-label="Task properties"
            className="min-w-0 border-t border-base-300/70 bg-workspace/70 px-5 py-6 sm:px-7 md:border-t-0 md:border-l"
          >
            <p className="mb-5 text-[10px] font-semibold tracking-[0.15em] text-base-content/65 uppercase">
              Task properties
            </p>
            <div className="space-y-4">
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
                  className="select composer-control h-10 w-full rounded-xl border-base-300/80 bg-base-100 text-xs font-normal"
                >
                  <option value="todo">To do</option>
                  <option value="in_progress">In progress</option>
                  <option value="in_review">In review</option>
                  <option value="done">Done</option>
                </select>
                <FieldError
                  id={`${fieldId}-status-error`}
                  errors={errors.status}
                />
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
                  className="select composer-control h-10 w-full rounded-xl border-base-300/80 bg-base-100 text-xs font-normal"
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
                  defaultValue={initialValues?.epic ?? defaultEpic ?? ""}
                  className="select composer-control h-10 w-full rounded-xl border-base-300/80 bg-base-100 text-xs font-normal"
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
                  className="select composer-control h-10 w-full rounded-xl border-base-300/80 bg-base-100 text-xs font-normal"
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
            <div className="mt-4 space-y-4">
              <div className="flex min-w-0 flex-col gap-2 text-xs font-medium">
                <label htmlFor={`${fieldId}-labels`}>Labels</label>
                <input
                  id={`${fieldId}-labels`}
                  name="labels"
                  type="text"
                  value={labels}
                  onChange={(event) => setLabels(event.target.value)}
                  className="input composer-control h-10 w-full rounded-xl border-base-300/80 bg-base-100 text-xs font-normal"
                  placeholder="design, accessibility"
                  aria-invalid={Boolean(errors.labels)}
                  aria-describedby={
                    errors.labels
                      ? `${fieldId}-labels-error`
                      : `${fieldId}-labels-hint`
                  }
                />
                <p
                  id={`${fieldId}-labels-hint`}
                  className="font-normal text-base-content/65"
                >
                  Separate with commas · Up to five labels.
                </p>
                <FieldError
                  id={`${fieldId}-labels-error`}
                  errors={errors.labels}
                />
                {labelPreview.length > 0 && (
                  <ul
                    aria-label="Label preview"
                    className="flex flex-wrap gap-1.5"
                  >
                    {labelPreview.map((label) => (
                      <li key={label} className="min-w-0 max-w-full">
                        <TaskLabel label={label} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex min-w-0 flex-col gap-2 text-xs font-medium">
                <label htmlFor={`${fieldId}-dueDate`}>Due date</label>
                <input
                  id={`${fieldId}-dueDate`}
                  name="dueDate"
                  type="date"
                  defaultValue={initialValues?.dueDate ?? ""}
                  className="input composer-control h-10 w-full min-w-0 rounded-xl border-base-300/80 bg-base-100 text-xs font-normal"
                  aria-invalid={Boolean(errors.dueDate)}
                  aria-describedby={
                    errors.dueDate ? `${fieldId}-dueDate-error` : undefined
                  }
                />
                <FieldError
                  id={`${fieldId}-dueDate-error`}
                  errors={errors.dueDate}
                />
              </div>
            </div>
          </aside>
        </div>
        {children && (
          <div className="space-y-5 border-t border-base-300/70 px-5 py-6 sm:px-7">
            {children}
          </div>
        )}
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-base-300/70 bg-base-100 px-5 py-4 sm:px-7">
        {Object.keys(errors).length > 0 && (
          <p role="alert" className="w-full text-xs leading-6 text-rose-800">
            Review the highlighted fields, then check again.
          </p>
        )}
        {saveError && (
          <p
            role="alert"
            className="w-full rounded-xl bg-rose-50 px-4 py-3 text-xs leading-6 text-rose-800"
          >
            {saveError}
          </p>
        )}
        <span className="mr-auto hidden items-center gap-2 text-[10px] text-base-content/65 sm:flex">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-accent"
          />
          {initialValues
            ? "Changes save when you’re ready"
            : "Your next step starts here"}
        </span>
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
          className="btn btn-primary h-11 rounded-xl px-5 text-xs shadow-none"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
