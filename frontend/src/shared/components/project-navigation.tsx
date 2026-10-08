"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const links = [
  { href: "/my-work", label: "My Work", icon: "my-work" },
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/tasks", label: "Board", icon: "board" },
  { href: "/backlog", label: "Backlog", icon: "backlog" },
  { href: "/epics", label: "Epics", icon: "epics" },
  { href: "/sprints", label: "Sprints", icon: "sprints" },
  { href: "/tasks/archive", label: "Archive", icon: "archive" },
  { href: "/settings", label: "Settings", icon: "settings" },
];
export function ProjectNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="Project navigation">
      <ul className="menu w-full gap-1 p-0">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              onClick={(event) => {
                const details = event.currentTarget.closest("details");
                if (details) details.open = false;
              }}
              aria-current={
                pathname === link.href ||
                (link.href === "/epics" && pathname.startsWith("/epics/"))
                  ? "page"
                  : undefined
              }
              className={`${pathname === link.href || (link.href === "/epics" && pathname.startsWith("/epics/")) ? "nav-active" : ""} gap-3 rounded-xl px-3 py-3 text-sm font-medium`}
            >
              <NavigationIcon kind={link.icon} />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
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
      strokeWidth="1.7"
      className="size-5 shrink-0"
    >
      {kind === "epics" ? (
        <>
          <circle cx="12" cy="12" r="4" />
          <ellipse
            cx="12"
            cy="12"
            rx="10"
            ry="5"
            transform="rotate(-35 12 12)"
          />
        </>
      ) : kind === "my-work" ? (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
        </>
      ) : kind === "dashboard" ? (
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
      ) : kind === "sprints" ? (
        <>
          <circle cx="12" cy="13" r="8" />
          <path d="M9 2h6M12 9v4l3 2" />
        </>
      ) : kind === "board" ? (
        <>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M9 4v16M15 4v16" />
        </>
      ) : kind === "backlog" ? (
        <>
          <path d="M8 6h13M8 12h13M8 18h13" />
          <circle cx="4" cy="6" r="1" />
          <circle cx="4" cy="12" r="1" />
          <circle cx="4" cy="18" r="1" />
        </>
      ) : (
        <>
          <rect x="3" y="3" width="18" height="5" rx="1" />
          <path d="M5 8v12h14V8M9 12h6" />
        </>
      )}
    </svg>
  );
}
