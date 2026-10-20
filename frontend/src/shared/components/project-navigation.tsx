"use client";
import { LayoutGroup, m } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId } from "react";
import { useTaskStore } from "@/features/tasks/hooks/use-task-store";
const links = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: "dashboard",
    paths: ["/dashboard"],
  },
  {
    href: "/backlog",
    label: "Backlog & sprints",
    icon: "backlog",
    paths: ["/backlog", "/sprints"],
  },
  { href: "/tasks", label: "Board", icon: "board", paths: ["/tasks"] },
  {
    href: "/tasks/archive",
    label: "Archive",
    icon: "archive",
    paths: ["/tasks/archive"],
  },
  {
    href: "/settings",
    label: "Settings",
    icon: "settings",
    paths: ["/settings"],
  },
];
export function ProjectNavigation({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const id = useId();
  const { tasks, ready } = useTaskStore();
  const counts: Record<string, number> = {
    "/tasks": tasks.filter(
      (task) => !task.archived && task.placement === "board",
    ).length,
    "/backlog": tasks.filter(
      (task) => !task.archived && task.placement === "backlog",
    ).length,
    "/tasks/archive": tasks.filter((task) => task.archived).length,
  };
  return (
    <nav aria-label="Project navigation" className="px-3">
      <LayoutGroup id={id}>
        <ul className="flex flex-col gap-1">
          {links.map((link) => {
            const active = link.paths.includes(pathname);
            return (
              <li
                key={link.href}
                className={
                  link.href === "/settings"
                    ? "mt-5 border-t border-line pt-4"
                    : undefined
                }
              >
                <Link
                  href={link.href}
                  aria-current={
                    pathname === link.href
                      ? "page"
                      : active
                        ? "true"
                        : undefined
                  }
                  onClick={onNavigate}
                  className={`relative isolate flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors ${active ? "text-primary" : "text-subtle hover:bg-hover hover:text-base-content"}`}
                >
                  {active && (
                    <m.span
                      layoutId="active-navigation"
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 -z-10 rounded-xl bg-selected"
                      transition={{
                        type: "spring",
                        stiffness: 460,
                        damping: 38,
                      }}
                    />
                  )}
                  <NavigationIcon kind={link.icon} />
                  {link.label}
                  {ready && counts[link.href] !== undefined && (
                    <span
                      className={`ml-auto min-w-6 rounded-md px-1.5 py-0.5 text-center text-[11px] tabular-nums ${active ? "bg-primary/10" : "bg-base-content/5 text-subtlest"}`}
                    >
                      {counts[link.href]}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </LayoutGroup>
    </nav>
  );
}

function NavigationIcon({ kind }: { kind: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-4 shrink-0"
    >
      {kind === "dashboard" ? (
        <>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </>
      ) : kind === "settings" ? (
        <>
          <path d="M4 6h16M4 12h16M4 18h16" />
          <circle cx="9" cy="6" r="2" fill="currentColor" />
          <circle cx="15" cy="12" r="2" fill="currentColor" />
          <circle cx="9" cy="18" r="2" fill="currentColor" />
        </>
      ) : kind === "archive" ? (
        <>
          <rect x="3" y="3" width="18" height="5" rx="1.5" />
          <path d="M5 8v12h14V8M9 12h6" />
        </>
      ) : kind === "board" ? (
        <>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M9 4v16M15 4v16" />
        </>
      ) : (
        <>
          <path d="M8 6h13M8 12h13M8 18h13" />
          <circle cx="4" cy="6" r="1" />
          <circle cx="4" cy="12" r="1" />
          <circle cx="4" cy="18" r="1" />
        </>
      )}
    </svg>
  );
}
