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
import type { SaveResult } from "@/features/tasks/store/task-store";
import type { TaskStatus } from "@/features/tasks/types/task";
import {
  isTaskStatus,
  taskColumn,
  taskColumns,
} from "@/features/tasks/constants/task-statuses";
import { taskPriorities } from "@/features/tasks/constants/task-priorities";

type TaskFormProps = {
  epics: string[];
  assignees: string[];
  initialValues?: CreateTaskInput;
  titleRef: RefObject<HTMLInputElement | null>;
  submitLabel: string;
  onSave: (input: CreateTaskInput) => SaveResult;
  layout?: "create" | "details";
  banner?: ReactNode;
  main?: ReactNode;
  side?: ReactNode;
};

const splitLabels = (text: string) =>
  text
    .split(",")
    .map((label) => label.trim())
    .filter(Boolean);

function FieldError({
  id,
  errors,
}: {
  id: string;
  errors: string[] | undefined;
}) {
  if (!errors?.length) return null;
  return (
    <p id={id} className="text-xs leading-4 text-danger-text">
      {errors[0]}
    </p>
  );
}

function Field({
  id,
  label,
  inline,
  children,
}: {
  id: string;
  label: string;
  inline: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={
        inline
          ? "grid min-w-0 grid-cols-[6.5rem_minmax(0,1fr)] items-start gap-x-3"
          : "flex min-w-0 flex-col gap-1"
      }
    >
      <label
        htmlFor={id}
        className={
          inline
            ? "pt-1.5 text-sm font-medium text-subtle"
            : "text-xs font-semibold text-subtle"
        }
      >
        {label}
      </label>
      <div className="flex min-w-0 flex-col gap-1">{children}</div>
    </div>
  );
}

export function TaskForm({
  epics,
  assignees,
  initialValues,
  titleRef,
  submitLabel,
  onSave,
  layout = "create",
  banner,
  main,
  side,
}: TaskFormProps) {
  const fieldId = useId();
  const [errors, setErrors] = useState<CreateTaskFieldErrors>({});
  const [saveError, setSaveError] = useState("");
  const [status, setStatus] = useState<TaskStatus>(
    initialValues?.status ?? "todo",
  );
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );
  const [labels, setLabels] = useState(initialValues?.labels.join(", ") ?? "");
  const labelPreview = [...new Set(splitLabels(labels))].slice(0, 5);
  const details = layout === "details";
  const control = details
    ? "ui-field ui-field-subtle ui-field-compact"
    : "ui-field";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const result = createTaskSchema({ epics, assignees }).safeParse({
      title: values.get("title"),
      description: values.get("description"),
      labels: splitLabels(String(values.get("labels") ?? "")),
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

  const titleField = (
    <div className="flex min-w-0 flex-col gap-1">
      <label
        htmlFor={`${fieldId}-title`}
        className={details ? "sr-only" : "text-xs font-semibold text-subtle"}
      >
        Task title
        <span aria-hidden="true" className="text-danger-text">
          {" "}
          *
        </span>
      </label>
      <input
        id={`${fieldId}-title`}
        ref={titleRef}
        name="title"
        aria-required="true"
        aria-invalid={Boolean(errors.title)}
        aria-describedby={errors.title ? `${fieldId}-title-error` : undefined}
        defaultValue={initialValues?.title ?? ""}
        type="text"
        className={
          details
            ? "ui-field ui-field-subtle -mx-2.5 w-[calc(100%+1.25rem)] text-2xl leading-7 font-semibold"
            : "ui-field"
        }
        placeholder="e.g. Design the project overview"
      />
      <FieldError id={`${fieldId}-title-error`} errors={errors.title} />
    </div>
  );

  const descriptionField = (
    <div className="flex min-w-0 flex-col gap-1">
      <label
        htmlFor={`${fieldId}-description`}
        className={
          details
            ? "text-base font-semibold"
            : "text-xs font-semibold text-subtle"
        }
      >
        Description
      </label>
      <textarea
        id={`${fieldId}-description`}
        name="description"
        rows={details ? 5 : 4}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        aria-invalid={Boolean(errors.description)}
        aria-describedby={
          errors.description
            ? `${fieldId}-description-error`
            : `${fieldId}-description-hint`
        }
        className="ui-field resize-y"
        placeholder="Add context, acceptance criteria, or helpful notes…"
      />
      <div className="flex flex-wrap justify-between gap-2 text-xs text-subtlest">
        <span id={`${fieldId}-description-hint`}>
          Optional · Plain text · Up to 5,000 characters.
        </span>
        <span
          aria-hidden="true"
          className={description.length > 5000 ? "text-danger-text" : ""}
        >
          {description.length.toLocaleString()} / 5,000
        </span>
      </div>
      <FieldError
        id={`${fieldId}-description-error`}
        errors={errors.description}
      />
    </div>
  );

  const statusSelect = (
    <select
      id={`${fieldId}-status`}
      name="status"
      aria-invalid={Boolean(errors.status)}
      aria-describedby={errors.status ? `${fieldId}-status-error` : undefined}
      value={status}
      onChange={(event) => {
        if (isTaskStatus(event.target.value)) setStatus(event.target.value);
      }}
      className={
        details
          ? `ui-field ui-field-compact w-auto self-start border-transparent font-semibold ${taskColumn(status).lozenge}`
          : "ui-field"
      }
    >
      {taskColumns.map((column) => (
        <option key={column.status} value={column.status}>
          {column.label}
        </option>
      ))}
    </select>
  );

  const detailFields = (
    <>
      <Field id={`${fieldId}-assignee`} label="Assignee" inline={details}>
        <select
          id={`${fieldId}-assignee`}
          name="assignee"
          aria-invalid={Boolean(errors.assignee)}
          aria-describedby={
            errors.assignee ? `${fieldId}-assignee-error` : undefined
          }
          defaultValue={initialValues?.assignee ?? ""}
          className={control}
        >
          <option value="">Unassigned</option>
          {assignees.map((assignee) => (
            <option key={assignee} value={assignee}>
              {assignee}
            </option>
          ))}
        </select>
        <FieldError id={`${fieldId}-assignee-error`} errors={errors.assignee} />
      </Field>
      <Field id={`${fieldId}-priority`} label="Priority" inline={details}>
        <select
          id={`${fieldId}-priority`}
          name="priority"
          aria-invalid={Boolean(errors.priority)}
          aria-describedby={
            errors.priority ? `${fieldId}-priority-error` : undefined
          }
          defaultValue={initialValues?.priority ?? "medium"}
          className={control}
        >
          {taskPriorities.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError id={`${fieldId}-priority-error`} errors={errors.priority} />
      </Field>
      <Field id={`${fieldId}-epic`} label="Epic" inline={details}>
        <select
          id={`${fieldId}-epic`}
          name="epic"
          aria-invalid={Boolean(errors.epic)}
          aria-describedby={errors.epic ? `${fieldId}-epic-error` : undefined}
          defaultValue={initialValues?.epic ?? ""}
          className={control}
        >
          <option value="">No epic</option>
          {epics.map((epic) => (
            <option key={epic} value={epic}>
              {epic}
            </option>
          ))}
        </select>
        <FieldError id={`${fieldId}-epic-error`} errors={errors.epic} />
      </Field>
      <Field id={`${fieldId}-labels`} label="Labels" inline={details}>
        <input
          id={`${fieldId}-labels`}
          name="labels"
          type="text"
          value={labels}
          onChange={(event) => setLabels(event.target.value)}
          className={control}
          placeholder="design, accessibility"
          aria-invalid={Boolean(errors.labels)}
          aria-describedby={
            errors.labels ? `${fieldId}-labels-error` : `${fieldId}-labels-hint`
          }
        />
        <p id={`${fieldId}-labels-hint`} className="text-xs text-subtlest">
          Separate with commas · Up to five labels.
        </p>
        <FieldError id={`${fieldId}-labels-error`} errors={errors.labels} />
        {labelPreview.length > 0 && (
          <ul aria-label="Label preview" className="flex flex-wrap gap-1">
            {labelPreview.map((label) => (
              <li key={label} className="min-w-0 max-w-full">
                <TaskLabel label={label} />
              </li>
            ))}
          </ul>
        )}
      </Field>
      <Field id={`${fieldId}-dueDate`} label="Due date" inline={details}>
        <input
          id={`${fieldId}-dueDate`}
          name="dueDate"
          type="date"
          defaultValue={initialValues?.dueDate ?? ""}
          className={control}
          aria-invalid={Boolean(errors.dueDate)}
          aria-describedby={
            errors.dueDate ? `${fieldId}-dueDate-error` : undefined
          }
        />
        <FieldError id={`${fieldId}-dueDate-error`} errors={errors.dueDate} />
      </Field>
    </>
  );

  const alerts = (
    <>
      {Object.keys(errors).length > 0 && (
        <p role="alert" className="text-sm text-danger-text">
          Review the highlighted fields, then check again.
        </p>
      )}
      {saveError && (
        <p role="alert" className="text-sm text-danger-text">
          {saveError}
        </p>
      )}
    </>
  );

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
      {details ? (
        <div className="grid min-h-0 gap-8 overflow-y-auto px-6 pt-1 pb-6 md:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0 space-y-6">
            {banner}
            {titleField}
            {descriptionField}
            {main}
          </div>
          <div className="min-w-0 space-y-4">
            <div className="flex flex-col gap-1">
              <label htmlFor={`${fieldId}-status`} className="sr-only">
                Status
              </label>
              {statusSelect}
              <FieldError
                id={`${fieldId}-status-error`}
                errors={errors.status}
              />
            </div>
            <section
              aria-labelledby={`${fieldId}-details-heading`}
              className="rounded-md border border-line"
            >
              <h3
                id={`${fieldId}-details-heading`}
                className="border-b border-line px-4 py-3 font-semibold"
              >
                Details
              </h3>
              <div className="space-y-2 p-4">
                {detailFields}
                {side}
              </div>
            </section>
          </div>
        </div>
      ) : (
        <div className="space-y-5 overflow-y-auto px-6 pt-1 pb-6">
          <p className="text-sm text-subtle">
            Required fields are marked with an asterisk{" "}
            <span className="text-danger-text">*</span>
          </p>
          {titleField}
          {descriptionField}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id={`${fieldId}-status`} label="Status" inline={false}>
              {statusSelect}
              <FieldError
                id={`${fieldId}-status-error`}
                errors={errors.status}
              />
            </Field>
            {detailFields}
          </div>
        </div>
      )}
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-line px-6 py-4">
        <div className="mr-auto min-w-0">{alerts}</div>
        <Dialog.CloseTrigger asChild>
          <button type="button" className="ui-button ui-button-subtle">
            Cancel
          </button>
        </Dialog.CloseTrigger>
        <button type="submit" className="ui-button ui-button-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
