"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const links = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: "dashboard",
    paths: ["/dashboard"],
  },
  {
    href: "/backlog",
    label: "Backlog",
    icon: "backlog",
    paths: ["/backlog", "/tasks/archive"],
  },
  { href: "/tasks", label: "Board", icon: "board", paths: ["/tasks"] },
  {
    href: "/settings",
    label: "Settings",
    icon: "settings",
    paths: ["/settings"],
  },
];
export function ProjectNavigation({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Project navigation" className="px-2">
      <ul className="flex flex-col gap-0.5">
        {links.map((link) => {
          const active = link.paths.includes(pathname);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={
                  pathname === link.href ? "page" : active ? "true" : undefined
                }
                onClick={onNavigate}
                className={`relative flex items-center gap-3 rounded px-3 py-2 font-medium ${active ? "bg-selected text-primary before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-full before:bg-primary" : "text-subtle hover:bg-hover"}`}
              >
                <NavigationIcon kind={link.icon} />
                {link.label}
              </Link>
            </li>
          );
        })}
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
