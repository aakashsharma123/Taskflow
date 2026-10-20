"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { Dialog } from "@ark-ui/react/dialog";
import { Portal } from "@ark-ui/react/portal";
import { m } from "framer-motion";
import { GlobalCreateTask } from "@/features/tasks/components/global-create-task";
import { useTaskStore } from "@/features/tasks/hooks/use-task-store";
import { OrbitMark } from "@/shared/ui/orbit-mark";
import { MAIN_CONTENT_ID } from "./main-content";
import { ProjectNavigation } from "./project-navigation";
import { ThemeSelect } from "./theme-select";

function SidebarIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="size-4"
    >
      <rect x="2" y="3" width="16" height="14" rx="3" />
      <path d="M7 3v14" />
    </svg>
  );
}

function SidebarContent({ onNavigate }: { onNavigate: () => void }) {
  const { settings, ready, tasks, error } = useTaskStore();
  const openTasks = tasks.filter(
    (task) => !task.archived && task.status !== "done",
  ).length;
  return (
    <>
      <div className="mx-4 mt-6 mb-8 flex min-w-0 items-center gap-3 rounded-xl border border-line bg-base-100/60 p-3">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary font-semibold text-secondary-content"
          aria-hidden="true"
        >
          {settings.projectName.trim().slice(0, 1).toUpperCase() || "O"}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold" title={settings.projectName}>
            {settings.projectName}
          </p>
          <p className="mt-0.5 text-xs text-subtle">Project workspace</p>
        </div>
      </div>
      <p className="ui-eyebrow mb-3 px-6">Workspace</p>
      <ProjectNavigation onNavigate={onNavigate} />
      <div className="mx-5 mt-auto pt-10 pb-6">
        <div className="border-t border-line pt-5">
          <p className="flex items-center gap-2 text-xs font-medium text-subtle">
            <span
              className={`size-1.5 rounded-full ${error ? "bg-danger" : "bg-primary"}`}
              aria-hidden="true"
            />
            Local workspace
          </p>
          <p className="mt-2 text-xs leading-5 text-subtlest">
            {ready && !error
              ? `${openTasks} open ${openTasks === 1 ? "task" : "tasks"} · Saved in this browser`
              : error
                ? "Storage needs attention"
                : "Loading your workspace…"}
          </p>
        </div>
      </div>
    </>
  );
}

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerPath, setDrawerPath] = useState<string | null>(null);
  const drawerOpen = drawerPath === pathname;
  const drawerToggleRef = useRef<HTMLButtonElement>(null);
  const closeDrawer = () => setDrawerPath(null);
  return (
    <Dialog.Root
      open={drawerOpen}
      onOpenChange={({ open }) => setDrawerPath(open ? pathname : null)}
      finalFocusEl={() => drawerToggleRef.current}
      lazyMount
      unmountOnExit
    >
      <div className="min-h-screen bg-canvas">
        <a
          href={`#${MAIN_CONTENT_ID}`}
          className="ui-button ui-button-primary fixed top-3 left-3 z-[70] -translate-y-24 focus:translate-y-0"
        >
          Skip to content
        </a>
        <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b border-line bg-base-100 px-3 sm:px-5">
          <Dialog.Trigger asChild>
            <button
              ref={drawerToggleRef}
              type="button"
              aria-label="Open navigation"
              className="ui-button ui-button-subtle ui-button-icon lg:hidden"
            >
              <SidebarIcon />
            </button>
          </Dialog.Trigger>
          <Link
            href="/tasks"
            aria-label="Orbit board"
            className="hidden shrink-0 items-center gap-2.5 min-[380px]:flex rounded-lg px-1 py-1.5 lg:w-48"
          >
            <span className="grid size-8 place-items-center rounded-[10px] bg-primary text-primary-content">
              <OrbitMark className="size-6" />
            </span>
            <span className="hidden text-xl font-semibold tracking-[-0.06em] sm:inline">
              orbit<span className="text-primary">.</span>
            </span>
          </Link>
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-controls="project-sidebar"
            aria-expanded={!collapsed}
            className="ui-button ui-button-subtle ui-button-icon hidden lg:inline-flex"
            onClick={() => setCollapsed((value) => !value)}
          >
            <SidebarIcon />
          </button>
          <span className="ml-3 hidden border-l border-line pl-5 text-xs text-subtlest md:inline">
            Project workspace
          </span>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <ThemeSelect />
            <GlobalCreateTask />
          </div>
        </header>
        <div className="lg:flex">
          <aside
            id="project-sidebar"
            aria-label="Project"
            className={`${collapsed ? "hidden" : "hidden lg:flex"} sticky top-16 h-[calc(100dvh-4rem)] w-60 shrink-0 flex-col overflow-y-auto border-r border-line bg-sidebar`}
          >
            <SidebarContent onNavigate={closeDrawer} />
          </aside>
          <main
            id={MAIN_CONTENT_ID}
            tabIndex={-1}
            className="min-w-0 flex-1 px-4 pt-7 pb-10 outline-none sm:px-7 sm:pt-9 xl:px-10"
          >
            <div className="mx-auto max-w-[1600px]">{children}</div>
          </main>
        </div>
      </div>
      <Portal>
        <Dialog.Backdrop asChild>
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-blanket backdrop-blur-sm"
          />
        </Dialog.Backdrop>
        <Dialog.Positioner className="fixed inset-0 z-50 flex">
          <Dialog.Content asChild>
            <m.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex h-dvh w-[min(19rem,calc(100vw-3rem))] flex-col overflow-y-auto border-r border-line bg-sidebar shadow-overlay outline-none"
            >
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
                <Dialog.Title className="text-base font-semibold">
                  Your workspace
                </Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <button
                    type="button"
                    aria-label="Close navigation"
                    className="ui-button ui-button-subtle ui-button-icon"
                  >
                    <span aria-hidden="true" className="text-xl">
                      ×
                    </span>
                  </button>
                </Dialog.CloseTrigger>
              </div>
              <Dialog.Description className="sr-only">
                Navigate between your project overview, board, planning,
                archive, and settings.
              </Dialog.Description>
              <SidebarContent onNavigate={closeDrawer} />
            </m.div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
