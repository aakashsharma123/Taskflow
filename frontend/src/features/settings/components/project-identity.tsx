"use client";
import { OrbitMark } from "@/shared/ui/orbit-mark";
import { useWorkspace } from "@/features/workspace/components/workspace-provider";
export function ProjectIdentity() {
  const { settings } = useWorkspace();
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary/15 text-secondary shadow-sm"
      >
        <OrbitMark className="size-8" />
      </span>
      <div className="min-w-0">
        <p className="text-xl font-semibold tracking-tight [overflow-wrap:anywhere]">
          {settings.projectName}
        </p>
        <p className="mt-1 text-[11px] text-primary-content/75">
          Project workspace
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
