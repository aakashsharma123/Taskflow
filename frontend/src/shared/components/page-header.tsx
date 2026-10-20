"use client";

import Link from "next/link";
import { useTaskStore } from "@/features/tasks/hooks/use-task-store";

const descriptions: Record<string, string> = {
  Board: "Keep work moving, one clear next step at a time.",
  Dashboard: "A clear view of your progress and what needs attention.",
  Backlog: "Make room for ideas. Shape what comes next.",
  Archive: "Completed chapters, always within reach.",
  "Workspace settings": "Make this workspace feel like yours.",
};

export function PageHeader({
  title,
  parent,
}: {
  title: string;
  parent?: { href: string; label: string };
}) {
  const { settings } = useTaskStore();
  return (
    <header className="mb-8">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-xs text-subtlest">
          <li>Workspace</li>
          <li aria-hidden="true" className="opacity-50">
            /
          </li>
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
      <h1 className="mt-4 text-[28px] leading-tight font-semibold tracking-[-0.045em] sm:text-[34px]">
        {title}
      </h1>
      {descriptions[title] && (
        <p className="mt-2 max-w-xl text-sm leading-6 text-subtle">
          {descriptions[title]}
        </p>
      )}
    </header>
  );
}
