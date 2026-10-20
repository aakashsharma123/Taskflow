"use client";

import type { ReactNode } from "react";
import { Dialog } from "@ark-ui/react/dialog";
import { Portal } from "@ark-ui/react/portal";
import { m } from "framer-motion";

export function DialogPanel({
  title,
  description,
  variant = "form",
  actions,
  children,
}: {
  title: ReactNode;
  description?: string;
  variant?: "form" | "issue";
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Portal>
      <Dialog.Backdrop asChild>
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-40 bg-blanket backdrop-blur-sm"
        />
      </Dialog.Backdrop>
      <Dialog.Positioner className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:pt-[6vh]">
        <Dialog.Content
          asChild
          className={`flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-2xl border border-line bg-base-100 text-base-content shadow-overlay outline-none sm:max-h-[88vh] ${variant === "issue" ? "max-w-5xl" : "max-w-[37.5rem]"}`}
        >
          <m.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 px-6 pt-6 pb-5">
              <div className="min-w-0">
                <Dialog.Title
                  className={
                    variant === "issue"
                      ? "flex flex-wrap items-center gap-2 text-sm text-subtle"
                      : "text-xl leading-7 font-semibold tracking-tight"
                  }
                >
                  {title}
                </Dialog.Title>
                {description && (
                  <Dialog.Description className="mt-2 text-subtle">
                    {description}
                  </Dialog.Description>
                )}
              </div>
              <div className="-mt-1 -mr-2 flex shrink-0 items-center gap-1">
                {actions}
                <Dialog.CloseTrigger asChild>
                  <button
                    type="button"
                    aria-label="Close dialog"
                    className="ui-button ui-button-subtle ui-button-icon"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="size-4"
                    >
                      <path d="m4 4 8 8M12 4l-8 8" />
                    </svg>
                  </button>
                </Dialog.CloseTrigger>
              </div>
            </div>
            {children}
          </m.div>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  );
}
