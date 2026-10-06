"use client";
import { useWorkspace } from "./workspace-provider";
import type { ReactNode } from "react";
export function WorkspaceState({ children }: { children: ReactNode }) {
  const { ready, error, reload } = useWorkspace();
  if (!ready)
    return (
      <p
        role="status"
        className="rounded-2xl border border-base-300 bg-base-100 p-6 text-sm text-base-content/65"
      >
        Loading your workspace…
      </p>
    );
  if (error)
    return (
      <div
        role="alert"
        className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-xs leading-6 text-rose-800"
      >
        {error}
        <button
          type="button"
          className="btn btn-ghost btn-sm ml-2"
          onClick={reload}
        >
          Try again
        </button>
      </div>
    );
  return children;
}
