"use client";
import Link from "next/link";
import { WorkspaceSearch } from "@/features/search/components/workspace-search";
import { useWorkspace } from "@/features/workspace/components/workspace-provider";
export function WorkspaceToolbar() {
  const { settings, ready, error } = useWorkspace();
  return (
    <div className="flex items-center gap-3 border-b border-base-300/60 bg-base-100/60 px-5 py-3 sm:px-7">
      <WorkspaceSearch />
      <p className="ml-auto hidden text-[10px] text-base-content/65 md:block">
        {error
          ? "Storage needs attention"
          : ready
            ? "Saved on this device"
            : "Loading workspace…"}
      </p>
      <Link
        href="/my-work"
        aria-label={
          settings.currentMember
            ? `My Work for ${settings.currentMember}`
            : "Open My Work"
        }
        title={settings.currentMember ?? "My Work"}
        className="flex size-11 shrink-0 items-center justify-center rounded-full border border-secondary/60 bg-secondary/30 text-xs font-semibold"
      >
        {settings.currentMember ? (
          settings.currentMember
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")
        ) : (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
          </svg>
        )}
      </Link>
    </div>
  );
}
