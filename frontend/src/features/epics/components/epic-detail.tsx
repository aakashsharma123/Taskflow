"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useWorkspace } from "@/features/workspace/components/workspace-provider";
import { WorkspaceState } from "@/features/workspace/components/workspace-state";
import { useTaskActions } from "@/features/tasks/components/task-actions-provider";
import { CreateTaskDialog } from "@/features/tasks/components/create-task-dialog";
import { TaskCard } from "@/features/tasks/components/task-card";
import { OrbitMark } from "@/shared/ui/orbit-mark";
import { taskColumns } from "@/features/tasks/constants/task-statuses";
import { createEpicSchema } from "../schemas/create-epic-schema";

export function EpicDetail({ name }: { name: string }) {
  const workspace = useWorkspace();
  const { openTask } = useTaskActions();
  const router = useRouter();
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [filter, setFilter] = useState("all");
  const items = workspace.tasks.filter((task) => task.epic === name);
  const completed = items.filter((task) => task.status === "done").length;
  const percent = items.length
    ? Math.round((completed / items.length) * 100)
    : 0;
  const visible = items.filter((task) =>
    filter === "archived"
      ? task.archived
      : !task.archived && (filter === "all" || task.status === filter),
  );
  function rename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const validated = createEpicSchema(
      workspace.epics.filter((epic) => epic !== name),
    ).safeParse(new FormData(form).get("epicName"));
    if (!validated.success) {
      setError(validated.error.issues[0].message);
      form.querySelector<HTMLInputElement>("input")?.focus();
      return;
    }
    const result = workspace.renameEpic(name, validated.data);
    setError(result.ok ? "" : result.error);
    if (result.ok)
      router.replace(`/epics/${encodeURIComponent(validated.data)}`);
  }
  return (
    <WorkspaceState>
      {!workspace.epics.includes(name) ? (
        <div className="rounded-2xl border border-dashed border-base-300 p-8 text-center">
          <h1 className="text-xl font-semibold">This epic is unavailable</h1>
          <p className="mt-3 text-xs text-base-content/65">
            It may have been renamed or removed from this workspace.
          </p>
          <Link
            href="/epics"
            className="btn btn-primary btn-sm mt-5 rounded-xl"
          >
            View epics
          </Link>
        </div>
      ) : (
        <div>
          <Link
            href="/epics"
            className="inline-flex min-h-10 items-center gap-2 text-xs font-medium text-base-content/65 hover:text-primary"
          >
            <span aria-hidden="true">←</span> All epics
          </Link>
          <section className="mt-3 rounded-3xl border border-secondary/60 bg-secondary/15 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary/40">
                <OrbitMark className="size-8" />
              </span>
              <div className="min-w-0">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-base-content/65">
                  Epic
                </p>
                <h1 className="text-2xl font-semibold tracking-tight [overflow-wrap:anywhere] sm:text-3xl">
                  {name}
                </h1>
                <p className="mt-3 text-xs text-base-content/65">
                  {items.length} linked tasks · {completed} completed ·{" "}
                  {items.filter((task) => task.archived).length} archived
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <progress
                aria-label="Epic completion"
                value={completed}
                max={items.length || 1}
                className="progress progress-primary h-2 flex-1"
              />
              <span className="text-sm font-semibold">{percent}%</span>
            </div>
          </section>
          <div className="mt-7 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
            <section aria-label="Linked tasks">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <label className="text-[11px] font-medium">
                  Show tasks
                  <select
                    className="select ml-2 w-auto rounded-xl text-xs"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    aria-label="Epic task filter"
                  >
                    <option value="all">All active</option>
                    {taskColumns.map((column) => (
                      <option key={column.status} value={column.status}>
                        {column.label}
                      </option>
                    ))}
                    <option value="archived">Archived</option>
                  </select>
                </label>
                <CreateTaskDialog
                  epics={workspace.epics}
                  assignees={workspace.settings.members}
                  defaultEpic={name}
                  onCreate={(input) => workspace.createTask(input, "backlog")}
                />
              </div>
              {visible.length ? (
                <ul className="grid gap-4 md:grid-cols-2">
                  {visible.map((task) => (
                    <li key={task.id}>
                      <p className="mb-2 text-[10px] font-medium text-base-content/65">
                        {task.archived
                          ? "Archived"
                          : task.placement === "board"
                            ? "Board"
                            : "Backlog"}{" "}
                        ·{" "}
                        {
                          taskColumns.find(
                            (column) => column.status === task.status,
                          )?.label
                        }
                      </p>
                      <TaskCard task={task} onOpen={() => openTask(task.id)} />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-2xl border border-dashed border-base-300 px-5 py-12 text-center">
                  <h2 className="text-sm font-semibold">
                    No tasks in this view
                  </h2>
                  <p className="mt-2 text-xs leading-6 text-base-content/65">
                    Create a task for this epic or adjust the filter. New work
                    starts in Backlog.
                  </p>
                </div>
              )}
            </section>
            <aside className="rounded-2xl border border-base-300 bg-base-100 p-5">
              <h2 className="text-sm font-semibold">Manage epic</h2>
              <form key={name} className="mt-4" onSubmit={rename} noValidate>
                <label className="text-[11px] font-medium">
                  Epic name
                  <input
                    name="epicName"
                    className="input mt-2 w-full rounded-xl"
                    defaultValue={name}
                    maxLength={60}
                    onChange={() => setError("")}
                  />
                </label>
                <button
                  className="btn btn-outline btn-sm mt-3 rounded-xl"
                  type="submit"
                >
                  Rename epic
                </button>
              </form>
              <p className="mt-3 text-[10px] leading-5 text-base-content/65">
                Renaming updates all linked tasks.
              </p>
              <div className="mt-6 border-t border-base-300 pt-4">
                {confirm ? (
                  <>
                    <p className="text-xs leading-6">
                      Remove “{name}”? Tasks and subtasks will remain. Their
                      epic assignment will be cleared.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setConfirm(false)}
                      >
                        Keep epic
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm border-rose-200 bg-rose-50 text-rose-800"
                        onClick={() => {
                          const result = workspace.deleteEpic(name);
                          setError(result.ok ? "" : result.error);
                          if (result.ok) router.push("/epics");
                        }}
                      >
                        Confirm removal
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm text-rose-800"
                    onClick={() => setConfirm(true)}
                  >
                    Remove epic
                  </button>
                )}
              </div>
              {error && (
                <p
                  role="alert"
                  className="mt-3 text-xs leading-6 text-rose-800"
                >
                  {error}
                </p>
              )}
            </aside>
          </div>
        </div>
      )}
    </WorkspaceState>
  );
}
