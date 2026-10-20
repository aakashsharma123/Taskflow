"use client";

import Link from "next/link";
import { useTaskStore } from "@/features/tasks/hooks/use-task-store";

export function PageHeader({
  title,
  parent,
}: {
  title: string;
  parent?: { href: string; label: string };
}) {
  const { settings } = useTaskStore();
  return (
    <header className="mb-5">
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-subtle">
          <li>Projects</li>
          <li aria-hidden="true">/</li>
          <li className="min-w-0 [overflow-wrap:anywhere]">
            {settings.projectName}
          </li>
          {parent && (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={parent.href} className="hover:underline">
                  {parent.label}
                </Link>
              </li>
            </>
          )}
        </ol>
      </nav>
      <h1 className="mt-2 text-2xl leading-7 font-semibold">{title}</h1>
    </header>
  );
}
