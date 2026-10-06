"use client";

import type { ReactNode } from "react";
import { Dialog } from "@ark-ui/react/dialog";
import { Portal } from "@ark-ui/react/portal";
import { OrbitMark } from "./orbit-mark";

export function DialogPanel({
  title,
  description,
  kind = "task",
  children,
}: {
  title: string;
  description: string;
  kind?: "task" | "epics" | "search";
  children: ReactNode;
}) {
  return (
    <Portal>
      <Dialog.Backdrop className="fixed inset-0 z-40 bg-primary/45 backdrop-blur-sm" />
      <Dialog.Positioner className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        <Dialog.Content className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[920px] flex-col overflow-hidden rounded-2xl border border-base-100/80 bg-base-100 text-base-content shadow-2xl outline-none sm:max-h-[calc(100dvh-3rem)] sm:rounded-[28px]">
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-base-300/70 px-5 py-5 sm:px-7 sm:py-6">
            <div className="flex min-w-0 items-start gap-4">
              <span
                aria-hidden="true"
                className="hidden size-12 shrink-0 items-center justify-center rounded-2xl border border-secondary/50 bg-secondary/25 text-primary sm:flex"
              >
                {kind !== "task" ? (
                  <OrbitMark className="size-7" />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="size-6"
                  >
                    <rect x="5" y="3" width="14" height="18" rx="3" />
                    <path d="M9 8h6M9 12h6M9 16h3" />
                  </svg>
                )}
              </span>
              <div className="min-w-0">
                <p className="mb-1.5 text-[10px] font-semibold tracking-[0.16em] text-base-content/65 uppercase">
                  Orbit /{" "}
                  {kind === "epics"
                    ? "Planning"
                    : kind === "search"
                      ? "Workspace"
                      : "Tasks"}
                </p>
                <Dialog.Title className="text-xl font-semibold tracking-tight [overflow-wrap:anywhere] sm:text-2xl">
                  {title}
                </Dialog.Title>
                <Dialog.Description className="mt-2 text-xs leading-5 text-base-content/65">
                  {description}
                </Dialog.Description>
              </div>
            </div>
            <Dialog.CloseTrigger asChild>
              <button
                type="button"
                aria-label="Close dialog"
                className="btn btn-ghost size-11 shrink-0 rounded-xl p-0 text-base-content/65"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="size-5"
                >
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </Dialog.CloseTrigger>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  );
}
