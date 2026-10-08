"use client";

import type { ReactNode } from "react";
import { Dialog } from "@ark-ui/react/dialog";
import { Portal } from "@ark-ui/react/portal";

export function DialogPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Portal>
      <Dialog.Backdrop className="fixed inset-0 z-40 bg-primary/45 backdrop-blur-sm" />
      <Dialog.Positioner className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Dialog.Content className="flex max-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-base-300 bg-base-100 text-base-content shadow-2xl outline-none">
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-base-300/70 bg-workspace px-6 py-5">
            <div>
              <p className="mb-2 flex items-center gap-2 text-[10px] font-medium tracking-widest text-base-content/70 uppercase">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-5 rounded-full bg-secondary"
                />
                Orbit / Board
              </p>
              <Dialog.Title className="text-xl font-semibold tracking-tight">
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-xs leading-6 text-base-content/75">
                {description}
              </Dialog.Description>
            </div>
            <Dialog.CloseTrigger asChild>
              <button
                type="button"
                aria-label="Close dialog"
                className="btn btn-ghost size-11 shrink-0 rounded-full p-0"
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
