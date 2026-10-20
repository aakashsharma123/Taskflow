"use client";
import { useId, useState, type FormEvent } from "react";
import { z } from "zod";
import {
  projectSettingsSchema,
  type ProjectSettingsInput,
} from "../schemas/workspace-settings-schema";
import { workspaceAppearances } from "../constants/workspace-appearances";
import type { WorkspaceSettings } from "../types/workspace-settings";
import type { SaveResult } from "@/features/tasks/store/task-store";

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
    <section aria-labelledby={`${id}-heading`} className="ui-panel p-5 sm:p-7">
      <h2 id={`${id}-heading`} className="ui-section-title">
        Project & appearance
      </h2>
      <p className="mt-2 text-sm leading-6 text-subtle">
        Set the project name and accent used in your workspace identity.
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
              className="ui-field"
              aria-invalid={Boolean(errors.projectName)}
              aria-describedby={
                errors.projectName ? `${id}-name-error` : undefined
              }
            />
            {errors.projectName && (
              <p id={`${id}-name-error`} className="text-xs text-danger-text">
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
                    className="flex cursor-pointer flex-wrap items-center gap-2 rounded-xl border border-line bg-panel-soft/50 p-3 transition-colors hover:bg-hover has-[:checked]:border-primary has-[:checked]:ring-1 has-[:checked]:ring-primary"
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
                    <span className="w-full text-xs font-medium">
                      {appearance.name}
                    </span>
                  </label>
                ),
              )}
            </div>
            {errors.appearance && (
              <p className="mt-2 text-xs text-danger-text">
                {errors.appearance[0]}
              </p>
            )}
          </fieldset>
          <button type="submit" className="ui-button ui-button-primary">
            Save settings
          </button>
        </fieldset>
        {Object.keys(errors).length > 0 && (
          <p role="alert" className="text-xs text-danger-text">
            Review the highlighted settings.
          </p>
        )}
        {error && (
          <p role="alert" className="text-xs leading-6 text-danger-text">
            {error}
          </p>
        )}
        <p role="status" className="text-xs text-success-text">
          {notice}
        </p>
      </form>
    </section>
  );
}
