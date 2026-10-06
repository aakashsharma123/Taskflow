"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Dialog } from "@ark-ui/react/dialog";
import { useWorkspace } from "@/features/workspace/components/workspace-provider";
import { useTaskActions } from "@/features/tasks/components/task-actions-provider";
import { DialogPanel } from "@/shared/ui/dialog-panel";
import { searchWorkspace } from "../lib/workspace-search";
import { taskColumns } from "@/features/tasks/constants/task-statuses";

export function WorkspaceSearch() {
  const { tasks, epics, sprints, ready, error } = useWorkspace();
  const { openTask } = useTaskActions();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const result = searchWorkspace(tasks, epics, sprints, query);
  const count =
    result.tasks.length + result.epics.length + result.sprints.length;
  const changeOpen = (value: boolean) => {
    setOpen(value);
    if (!value) setQuery("");
  };
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k" &&
        !document.querySelector('[role="dialog"]')
      ) {
        event.preventDefault();
        if (ready && !error) setOpen(true);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [ready, error]);
  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open }) => changeOpen(open)}
      initialFocusEl={() => input.current}
      lazyMount
      unmountOnExit
    >
      <Dialog.Trigger asChild>
        <button
          ref={trigger}
          type="button"
          disabled={!ready || Boolean(error)}
          className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-xl border border-base-300/80 bg-base-100 px-4 text-left text-xs text-base-content/65 transition hover:border-base-content/30 sm:max-w-sm"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="size-4 shrink-0"
          >
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
          <span className="truncate">Search Orbit</span>
          <kbd className="ml-auto hidden rounded-md border border-base-300 px-1.5 py-1 text-[9px] sm:block">
            ⌘ / Ctrl K
          </kbd>
        </button>
      </Dialog.Trigger>
      <DialogPanel
        kind="search"
        title="Find your next move"
        description="Search task titles, IDs, descriptions, labels, epics and sprints."
      >
        <div className="shrink-0 px-5 py-4 sm:px-7">
          <label className="sr-only" htmlFor="workspace-search">
            Search workspace
          </label>
          <input
            id="workspace-search"
            ref={input}
            type="search"
            maxLength={200}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try ORB-12 or a label…"
            className="input composer-control w-full rounded-xl"
          />
          <p role="status" className="mt-3 text-[11px] text-base-content/65">
            {query.trim()
              ? `${count} ${count === 1 ? "match" : "matches"}`
              : "Type to search your workspace."}
          </p>
        </div>
        <div className="min-h-0 overflow-y-auto px-5 pb-6 sm:px-7">
          {!query.trim() ? (
            <div className="rounded-2xl bg-secondary/15 p-5">
              <p className="text-xs font-semibold">A shortcut to everywhere.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { href: "/my-work", label: "My Work" },
                  { href: "/tasks", label: "Board" },
                  { href: "/backlog", label: "Backlog" },
                  { href: "/epics", label: "Epics" },
                  { href: "/sprints", label: "Sprints" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => changeOpen(false)}
                    className="btn btn-outline btn-sm rounded-xl"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : count === 0 ? (
            <p className="py-8 text-center text-xs leading-6 text-base-content/65">
              No matches. Try a shorter title, task ID or label.
            </p>
          ) : (
            <div className="space-y-5">
              {result.tasks.length > 0 && (
                <section aria-label="Matching tasks">
                  <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-base-content/65">
                    Tasks
                  </h2>
                  <ul className="space-y-1">
                    {result.tasks.slice(0, 50).map((task) => (
                      <li key={task.id}>
                        <button
                          type="button"
                          className="group flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left hover:bg-base-200/70"
                          onClick={() => {
                            changeOpen(false);
                            requestAnimationFrame(() => {
                              trigger.current?.focus();
                              openTask(task.id);
                            });
                          }}
                        >
                          <span className="shrink-0 rounded-md bg-secondary/30 px-2 py-1 text-[10px] font-medium">
                            ORB-{task.id}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-xs font-medium leading-6 [overflow-wrap:anywhere]">
                              {task.title}
                            </span>
                            <span className="text-[10px] text-base-content/65">
                              {task.archived
                                ? "Archived"
                                : task.placement === "backlog"
                                  ? "Backlog"
                                  : "Board"}{" "}
                              ·{" "}
                              {
                                taskColumns.find(
                                  (column) => column.status === task.status,
                                )?.label
                              }
                              {task.assignee ? ` · ${task.assignee}` : ""}
                            </span>
                          </span>
                          <span
                            aria-hidden="true"
                            className="ml-auto text-base-content/40"
                          >
                            ↗
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {result.tasks.length > 50 && (
                    <p className="mt-2 text-[11px] text-base-content/65">
                      Showing 50 tasks. Refine your search to find more.
                    </p>
                  )}
                </section>
              )}
              {result.epics.length > 0 && (
                <section aria-label="Matching epics">
                  <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-base-content/65">
                    Epics
                  </h2>
                  <ul>
                    {result.epics.map((name) => (
                      <li key={name}>
                        <Link
                          onClick={() => changeOpen(false)}
                          className="block rounded-xl px-3 py-3 text-xs font-medium hover:bg-base-200/70 [overflow-wrap:anywhere]"
                          href={`/epics/${encodeURIComponent(name)}`}
                        >
                          {name} <span aria-hidden="true">↗</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {result.sprints.length > 0 && (
                <section aria-label="Matching sprints">
                  <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-base-content/65">
                    Sprints
                  </h2>
                  <ul>
                    {result.sprints.map((sprint) => (
                      <li key={sprint.id}>
                        <Link
                          onClick={() => changeOpen(false)}
                          className="block rounded-xl px-3 py-3 text-xs font-medium hover:bg-base-200/70 [overflow-wrap:anywhere]"
                          href={`/sprints#sprint-${sprint.id}`}
                        >
                          {sprint.name}{" "}
                          <span className="ml-2 text-[10px] text-base-content/65">
                            {sprint.status}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </div>
      </DialogPanel>
    </Dialog.Root>
  );
}
