"use client";
import { useId, useState, type FormEvent } from "react";
import { z } from "zod";
import {
  createSprintSchema,
  type CreateSprintInput,
} from "../schemas/sprint-schema";
import type { SaveResult } from "@/features/tasks/store/task-store";

export function CreateSprintForm({
  disabled,
  onCreate,
}: {
  disabled: boolean;
  onCreate: (input: CreateSprintInput) => SaveResult;
}) {
  const id = useId();
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateSprintInput, string[]>>
  >({});
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const result = createSprintSchema.safeParse(
      Object.fromEntries(new FormData(form)),
    );
    if (!result.success) {
      const errors = z.flattenError(result.error).fieldErrors;
      setErrors(errors);
      const first = form.elements.namedItem(Object.keys(errors)[0]);
      if (first instanceof HTMLElement) first.focus();
      return;
    }
    setErrors({});
    const saved = onCreate(result.data);
    setError(saved.ok ? "" : saved.error);
    if (saved.ok) form.reset();
  }
  return (
    <details className="mb-5">
      <summary className="ui-button w-fit list-none [&::-webkit-details-marker]:hidden">
        Create sprint
      </summary>
      <form
        aria-label="Create sprint"
        noValidate
        onSubmit={submit}
        className="ui-panel mt-3 space-y-5 p-5 sm:max-w-2xl"
      >
        <fieldset
          disabled={disabled}
          className="grid min-w-0 gap-4 sm:grid-cols-2"
        >
          {(
            [
              { name: "name", label: "Sprint name", type: "text" },
              { name: "startDate", label: "Start date", type: "date" },
              { name: "endDate", label: "End date", type: "date" },
            ] as const
          ).map((field) => (
            <div key={field.name} className="flex min-w-0 flex-col gap-2">
              <label
                htmlFor={`${id}-${field.name}`}
                className="text-xs font-semibold text-subtle"
              >
                {field.label}
              </label>
              <input
                id={`${id}-${field.name}`}
                name={field.name}
                type={field.type}
                className="ui-field"
                aria-invalid={Boolean(errors[field.name])}
                aria-describedby={
                  errors[field.name] ? `${id}-${field.name}-error` : undefined
                }
              />
              {errors[field.name] && (
                <p
                  id={`${id}-${field.name}-error`}
                  className="text-xs text-danger-text"
                >
                  {errors[field.name]?.[0]}
                </p>
              )}
            </div>
          ))}
          <div className="flex min-w-0 flex-col gap-2 sm:col-span-2">
            <label
              htmlFor={`${id}-goal`}
              className="text-xs font-semibold text-subtle"
            >
              Sprint goal (optional)
            </label>
            <textarea
              id={`${id}-goal`}
              name="goal"
              rows={2}
              className="ui-field"
              placeholder="What will this sprint achieve?"
              aria-invalid={Boolean(errors.goal)}
              aria-describedby={errors.goal ? `${id}-goal-error` : undefined}
            />
            {errors.goal && (
              <p id={`${id}-goal-error`} className="text-xs text-danger-text">
                {errors.goal[0]}
              </p>
            )}
          </div>
          <button className="ui-button ui-button-primary w-fit" type="submit">
            Create sprint
          </button>
        </fieldset>
        {Object.keys(errors).length > 0 && (
          <p role="alert" className="text-sm text-danger-text">
            Review the highlighted sprint fields.
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-danger-text">
            {error}
          </p>
        )}
      </form>
    </details>
  );
}
