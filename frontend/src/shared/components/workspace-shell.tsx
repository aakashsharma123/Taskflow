import Link from "next/link";
import type { ReactNode } from "react";
import { TaskListIcon } from "@/shared/ui/task-list-icon";

function WorkspaceNavigation() {
  return (
    <nav aria-label="Workspace navigation">
      <p className="px-3 pb-3 text-[11px] font-medium tracking-[0.16em] text-base-content/60 uppercase">
        Workspace
      </p>
      <ul className="menu w-full p-0">
        <li>
          <Link
            href="/tasks"
            aria-current="page"
            className="nav-active gap-3 rounded-xl px-4 py-3.5"
          >
            <TaskListIcon className="size-5 shrink-0" />
            Tasks
            <span
              aria-hidden="true"
              className="ml-auto size-1.5 rounded-full bg-primary"
            />
          </Link>
        </li>
      </ul>
    </nav>
  );
}

function Brand() {
  return (
    <Link
      href="/tasks"
      aria-label="TaskFlow home"
      className="flex w-fit items-center gap-3 rounded-lg"
    >
      <span aria-hidden="true" className="brand-mark">
        t.
      </span>
      <span className="text-xl font-semibold tracking-[-0.04em]">
        TaskFlow<span className="text-primary">.</span>
      </span>
    </Link>
  );
}

export function WorkspaceShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <a
        href="#main-content"
        className="btn btn-primary fixed top-3 left-3 z-50 -translate-y-24 focus:translate-y-0"
      >
        Skip to content
      </a>
      <aside className="hidden border-r border-base-300 bg-base-100 px-5 py-7 lg:flex lg:flex-col">
        <div className="px-3">
          <Brand />
        </div>
        <div className="workspace-identity mt-10 flex items-center gap-3 rounded-xl border border-base-300 p-3">
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 grid-cols-2 gap-1 rounded-lg border border-base-300 bg-base-100 p-2.5 text-primary"
          >
            <span className="rounded-[1px] bg-current" />
            <span className="rounded-[1px] bg-current opacity-40" />
            <span className="rounded-[1px] bg-current opacity-40" />
            <span className="rounded-[1px] bg-current" />
          </span>
          <div>
            <p className="text-xs font-medium">Personal workspace</p>
            <p className="mt-1 text-[11px] text-base-content/65">
              A space to make progress
            </p>
          </div>
        </div>
        <div className="mt-8">
          <WorkspaceNavigation />
        </div>
        <div className="mt-auto pt-16">
          <div className="sidebar-note relative overflow-hidden rounded-2xl p-5">
            <span aria-hidden="true" className="sidebar-note-orbit" />
            <span aria-hidden="true" className="mb-5 block text-xl">
              ✦
            </span>
            <p className="relative text-sm font-medium">
              A little more clarity.
            </p>
            <p className="relative mt-2 max-w-36 text-xs leading-6 opacity-80">
              Space to focus on what matters.
            </p>
          </div>
          <p className="mt-5 px-1 text-[11px] text-base-content/60">
            Thoughtful work starts here.
          </p>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="border-b border-base-300 bg-base-100/90 px-5 py-4 sm:px-8 lg:px-10">
          <div className="flex min-h-9 items-center justify-between gap-4">
            <div className="lg:hidden">
              <Brand />
            </div>
            <p className="hidden items-center gap-3 text-sm lg:flex">
              <span className="text-base-content/60">Workspace</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="size-3 text-base-content/50"
              >
                <path d="m6 4 4 4-4 4" />
              </svg>
              <span className="font-medium">Tasks</span>
            </p>
            <span className="hidden items-center gap-2 text-xs text-base-content/65 sm:flex">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-primary/65"
              />
              Your space to focus
            </span>
          </div>
          <details className="mt-4 lg:hidden">
            <summary className="w-fit cursor-pointer rounded-md py-3 text-sm font-medium">
              Navigation
            </summary>
            <div className="pt-4 pb-2">
              <WorkspaceNavigation />
            </div>
          </details>
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="workspace-content px-5 py-9 outline-none sm:px-8 lg:px-10 lg:py-12"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
