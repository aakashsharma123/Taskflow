"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const links = [
  { href: "/backlog", label: "Backlog", icon: "≡" },
  { href: "/tasks", label: "Board", icon: "▥" },
  { href: "/tasks/archive", label: "Archive", icon: "□" },
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
              <span aria-hidden="true" className="w-5 text-center text-lg">
                {link.icon}
              </span>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
