"use client";
import { useWorkspace } from "@/features/workspace/components/workspace-provider";
export function ProjectIdentity() {
  const { settings } = useWorkspace();
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary/15 text-secondary shadow-sm"
      >
        <svg viewBox="0 0 40 40" className="size-8" fill="none">
          <circle cx="20" cy="20" r="8" fill="currentColor" />
          <ellipse
            cx="20"
            cy="20"
            rx="18"
            ry="9"
            transform="rotate(-35 20 20)"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </span>
      <div className="min-w-0">
        <p className="text-xl font-semibold tracking-tight [overflow-wrap:anywhere]">
          {settings.projectName}
        </p>
        <p className="mt-1 text-[11px] text-primary-content/75">
          Orbit · Software project
        </p>
      </div>
    </div>
  );
}
export function ProjectBreadcrumb() {
  const { settings } = useWorkspace();
  return (
    <p className="mb-2 text-xs text-base-content/60 [overflow-wrap:anywhere]">
      Projects / {settings.projectName}
    </p>
  );
}
