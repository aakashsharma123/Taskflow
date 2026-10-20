"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { GlobalCreateTask } from "@/features/tasks/components/global-create-task";
import { OrbitMark } from "@/shared/ui/orbit-mark";
import { MAIN_CONTENT_ID } from "./main-content";
import { ProjectNavigation } from "./project-navigation";

function SidebarIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="size-4"
    >
      <rect x="1.75" y="2.75" width="12.5" height="10.5" rx="1.5" />
      <path d="M6 2.75v10.5" />
    </svg>
  );
}

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerPath, setDrawerPath] = useState<string | null>(null);
  const drawerOpen = drawerPath === pathname;
  const drawerToggleRef = useRef<HTMLButtonElement>(null);
  const closeDrawer = () => setDrawerPath(null);
  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setDrawerPath(null);
      drawerToggleRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);
  return (
    <div className="min-h-screen">
      <a
        href={`#${MAIN_CONTENT_ID}`}
        className="ui-button ui-button-primary fixed top-3 left-3 z-[70] -translate-y-24 focus:translate-y-0"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 flex h-14 items-center gap-1 border-b border-line bg-base-100 px-3">
        <button
          ref={drawerToggleRef}
          type="button"
          aria-label="Project sidebar"
          aria-controls="project-sidebar"
          aria-expanded={drawerOpen}
          className="ui-button ui-button-subtle ui-button-icon lg:hidden"
          onClick={() => setDrawerPath(drawerOpen ? null : pathname)}
        >
          <SidebarIcon />
        </button>
        <button
          type="button"
          aria-label="Project sidebar"
          aria-controls="project-sidebar"
          aria-expanded={!collapsed}
          className="ui-button ui-button-subtle ui-button-icon hidden lg:inline-flex"
          onClick={() => setCollapsed((value) => !value)}
        >
          <SidebarIcon />
        </button>
        <Link
          href="/tasks"
          className="flex items-center gap-2 rounded px-2 py-1 hover:bg-hover"
        >
          <OrbitMark className="size-6 text-primary" />
          <span className="text-base font-semibold">Orbit</span>
        </Link>
        <div className="ml-auto">
          <GlobalCreateTask />
        </div>
      </header>
      <div className="lg:flex">
        {drawerOpen && (
          <div
            aria-hidden="true"
            className="fixed inset-0 top-14 z-20 bg-blanket lg:hidden"
            onClick={closeDrawer}
          />
        )}
        <aside
          id="project-sidebar"
          aria-label="Project"
          className={`${drawerOpen ? "flex" : "hidden"} ${collapsed ? "lg:hidden" : "lg:flex"} fixed top-14 bottom-0 left-0 z-30 w-64 flex-col overflow-y-auto border-r border-line bg-base-100 shadow-overlay lg:sticky lg:z-auto lg:h-[calc(100vh-3.5rem)] lg:w-60 lg:shrink-0 lg:shadow-none`}
        >
          <p className="px-4 pt-5 pb-2 text-[11px] font-bold tracking-wide text-subtle uppercase">
            Planning
          </p>
          <ProjectNavigation onNavigate={closeDrawer} />
        </aside>
        <main
          id={MAIN_CONTENT_ID}
          tabIndex={-1}
          className="min-w-0 flex-1 px-4 py-6 outline-none sm:px-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
