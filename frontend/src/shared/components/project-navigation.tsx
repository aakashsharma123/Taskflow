"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const links = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/backlog", label: "Backlog", icon: "backlog" },
  { href: "/tasks", label: "Board", icon: "board" },
  { href: "/tasks/archive", label: "Archive", icon: "archive" },
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
              aria-current={pathname === link.href ? "page" : undefined}
              className={`${pathname === link.href ? "nav-active" : ""} gap-3 rounded-md px-3 py-3 text-sm font-medium`}
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
      {kind === "dashboard" ? (
        <>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
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
