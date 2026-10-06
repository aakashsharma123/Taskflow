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
    <details className="mb-6 rounded-2xl border border-base-300 bg-base-100 p-5">
      <summary className="cursor-pointer text-sm font-semibold">
        Create a sprint
      </summary>
      <form
        aria-label="Create sprint"
        noValidate
        onSubmit={submit}
        className="mt-5 space-y-4"
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
                className="text-xs font-medium"
              >
                {field.label}
              </label>
              <input
                id={`${id}-${field.name}`}
                name={field.name}
                type={field.type}
                className="input w-full min-w-0 rounded-xl border-base-300 text-sm"
                aria-invalid={Boolean(errors[field.name])}
                aria-describedby={
                  errors[field.name] ? `${id}-${field.name}-error` : undefined
                }
              />
              {errors[field.name] && (
                <p
                  id={`${id}-${field.name}-error`}
                  className="text-xs text-rose-800"
                >
                  {errors[field.name]?.[0]}
                </p>
              )}
            </div>
          ))}
          <div className="flex min-w-0 flex-col gap-2 sm:col-span-2">
            <label htmlFor={`${id}-goal`} className="text-xs font-medium">
              Sprint goal (optional)
            </label>
            <textarea
              id={`${id}-goal`}
              name="goal"
              rows={2}
              className="textarea w-full rounded-xl border-base-300 text-sm"
              placeholder="What will this sprint achieve?"
              aria-invalid={Boolean(errors.goal)}
              aria-describedby={errors.goal ? `${id}-goal-error` : undefined}
            />
            {errors.goal && (
              <p id={`${id}-goal-error`} className="text-xs text-rose-800">
                {errors.goal[0]}
              </p>
            )}
          </div>
          <button
            className="btn btn-primary w-fit rounded-xl text-xs"
            type="submit"
          >
            Create sprint
          </button>
        </fieldset>
        {Object.keys(errors).length > 0 && (
          <p role="alert" className="text-xs text-rose-800">
            Review the highlighted sprint fields.
          </p>
        )}
        {error && (
          <p role="alert" className="text-xs text-rose-800">
            {error}
          </p>
        )}
      </form>
    </details>
  );
}
