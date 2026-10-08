"use client";
import { useId, useState, type FormEvent } from "react";
import { z } from "zod";
import {
  projectSettingsSchema,
  type ProjectSettingsInput,
} from "../schemas/workspace-settings-schema";
import { workspaceAppearances } from "../constants/workspace-appearances";
import type { WorkspaceSettings } from "../types/workspace-settings";
import type { SaveResult } from "@/features/workspace/store/workspace-store";

export function ProjectSettingsForm({
  settings,
  disabled,
  onSave,
}: {
  settings: WorkspaceSettings;
  disabled: boolean;
  onSave: (input: ProjectSettingsInput) => SaveResult;
}) {
  const id = useId();
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProjectSettingsInput, string[]>>
  >({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const result = projectSettingsSchema.safeParse(
      Object.fromEntries(new FormData(form)),
    );
    if (!result.success) {
      const errors = z.flattenError(result.error).fieldErrors;
      setErrors(errors);
      setNotice("");
      const control = form.elements.namedItem(Object.keys(errors)[0]);
      if (control instanceof HTMLElement) control.focus();
      return;
    }
    setErrors({});
    const saved = onSave(result.data);
    setError(saved.ok ? "" : saved.error);
    setNotice(saved.ok ? "Project settings saved." : "");
  }
  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="rounded-2xl border border-base-300/80 bg-base-100 p-5 sm:p-6"
    >
      <h2 id={`${id}-heading`} className="text-lg font-semibold">
        Project & appearance
      </h2>
      <p className="mt-2 text-xs leading-6 text-base-content/65">
        Choose a name and a calm accent for your workspace.
      </p>
      <form
        aria-label="Project settings"
        noValidate
        onSubmit={submit}
        className="mt-5 space-y-5"
      >
        <fieldset disabled={disabled} className="space-y-5">
          <div className="flex flex-col gap-2">
            <label htmlFor={`${id}-name`} className="text-xs font-medium">
              Project name
            </label>
            <input
              id={`${id}-name`}
              name="projectName"
              type="text"
              defaultValue={settings.projectName}
              className="input w-full rounded-xl border-base-300 text-sm"
              aria-invalid={Boolean(errors.projectName)}
              aria-describedby={
                errors.projectName ? `${id}-name-error` : undefined
              }
            />
            {errors.projectName && (
              <p id={`${id}-name-error`} className="text-xs text-rose-800">
                {errors.projectName[0]}
              </p>
            )}
          </div>
          <fieldset>
            <legend className="mb-3 text-xs font-medium">
              Workspace accent
            </legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {Object.entries(workspaceAppearances).map(
                ([value, appearance]) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-base-300 p-3 has-[:checked]:border-primary has-[:checked]:ring-1 has-[:checked]:ring-primary"
                  >
                    <input
                      type="radio"
                      name="appearance"
                      value={value}
                      defaultChecked={settings.appearance === value}
                      className="radio radio-primary radio-sm shrink-0"
                    />
                    <span
                      aria-hidden="true"
                      className="size-5 shrink-0 rounded-full border border-primary/10"
                      style={{ backgroundColor: appearance.accent }}
                    />
                    <span className="text-xs font-medium">
                      {appearance.name}
                    </span>
                  </label>
                ),
              )}
            </div>
            {errors.appearance && (
              <p className="mt-2 text-xs text-rose-800">
                {errors.appearance[0]}
              </p>
            )}
          </fieldset>
          <button type="submit" className="btn btn-primary rounded-xl text-xs">
            Save settings
          </button>
        </fieldset>
        {Object.keys(errors).length > 0 && (
          <p role="alert" className="text-xs text-rose-800">
            Review the highlighted settings.
          </p>
        )}
        {error && (
          <p role="alert" className="text-xs leading-6 text-rose-800">
            {error}
          </p>
        )}
        <p role="status" className="text-xs text-teal-800">
          {notice}
        </p>
      </form>
    </section>
  );
}
