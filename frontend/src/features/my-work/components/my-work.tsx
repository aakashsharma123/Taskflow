"use client";
import Link from "next/link";
import { useState } from "react";
import { useWorkspace } from "@/features/workspace/components/workspace-provider";
import { WorkspaceState } from "@/features/workspace/components/workspace-state";
import { useTaskActions } from "@/features/tasks/components/task-actions-provider";
import { TaskCard } from "@/features/tasks/components/task-card";
import { groupMyWork } from "../lib/my-work";
import { localDay } from "@/features/tasks/lib/task-dates";
import { OrbitMark } from "@/shared/ui/orbit-mark";

export function MyWork() {
  const { tasks, settings, selectMember } = useWorkspace();
  const { openTask } = useTaskActions();
  const [error, setError] = useState("");
  const member = settings.currentMember;
  const groups = groupMyWork(tasks, member ?? "", localDay());
  const openCount =
    groups.overdue.length +
    groups.today.length +
    groups.upcoming.length +
    groups.undated.length;
  return (
    <WorkspaceState>
      <div className="space-y-7">
        <section className="relative overflow-hidden rounded-3xl border border-secondary/60 bg-secondary/20 p-6 sm:p-8">
          <OrbitMark
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-8 size-64 text-secondary/40"
          />
          <div className="relative max-w-xl">
            <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-base-content/65">
              Your focus, in one place
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              {member
                ? `Let’s make progress, ${member.split(" ")[0]}.`
                : "Find your next move."}
            </h2>
            <p className="mt-3 text-xs leading-6 text-base-content/70">
              {member
                ? `${openCount} open tasks assigned to you across Board and Backlog.`
                : "Choose your local member name to see your assignments and due dates."}
            </p>
            <label className="mt-5 block max-w-xs text-[11px] font-medium">
              Viewing work for
              <select
                aria-label="Viewing work for"
                className="select mt-2 w-full rounded-xl bg-base-100"
                value={member ?? ""}
                onChange={(event) => {
                  const result = selectMember(event.target.value || null);
                  setError(result.ok ? "" : result.error);
                }}
              >
                <option value="">Choose a member</option>
                {settings.members.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </label>
            {error && (
              <p role="alert" className="mt-3 text-xs text-rose-800">
                {error}
              </p>
            )}
          </div>
        </section>
        {member ? (
          <>
            <dl className="grid grid-cols-3 gap-3">
              {[
                { label: "Open tasks", value: openCount },
                { label: "Overdue", value: groups.overdue.length },
                { label: "Due today", value: groups.today.length },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-5"
                >
                  <dt className="text-[10px] text-base-content/65">
                    {item.label}
                  </dt>
                  <dd
                    className={`mt-2 text-3xl font-semibold ${item.label === "Overdue" && item.value ? "text-rose-700" : ""}`}
                  >
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
            {openCount === 0 && (
              <div className="rounded-2xl border border-dashed border-base-300 p-8 text-center">
                <h2 className="text-base font-semibold">
                  You’re all caught up.
                </h2>
                <p className="mt-2 text-xs leading-6 text-base-content/65">
                  Pick up your next task from the board or backlog.
                </p>
                <Link
                  href="/tasks"
                  className="btn btn-primary btn-sm mt-4 rounded-xl"
                >
                  Explore the board
                </Link>
              </div>
            )}
            {(
              [
                {
                  key: "overdue",
                  label: "Needs your attention",
                  hint: "Past the due date",
                  tone: "text-rose-700",
                },
                {
                  key: "today",
                  label: "Today’s focus",
                  hint: "Due today",
                  tone: "",
                },
                {
                  key: "upcoming",
                  label: "Coming up",
                  hint: "Future due dates",
                  tone: "",
                },
                {
                  key: "undated",
                  label: "On your radar",
                  hint: "No due date yet",
                  tone: "",
                },
              ] as const
            ).map(
              (group) =>
                groups[group.key].length > 0 && (
                  <section key={group.key} aria-label={group.label}>
                    <div className="mb-4 flex flex-wrap items-baseline gap-2">
                      <h2 className={`text-sm font-semibold ${group.tone}`}>
                        {group.label}
                      </h2>
                      <span className="text-xs text-base-content/60">
                        {groups[group.key].length} · {group.hint}
                      </span>
                    </div>
                    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {groups[group.key].map((task) => (
                        <li key={task.id}>
                          <p className="mb-2 text-[10px] font-medium text-base-content/60">
                            {task.placement === "backlog" ? "Backlog" : "Board"}
                          </p>
                          <TaskCard
                            task={task}
                            onOpen={() => openTask(task.id)}
                          />
                        </li>
                      ))}
                    </ul>
                  </section>
                ),
            )}
            {groups.completed.length > 0 && (
              <details className="rounded-2xl border border-base-300 bg-base-100 p-5">
                <summary className="cursor-pointer py-1 text-sm font-semibold">
                  Completed work{" "}
                  <span className="text-base-content/60">
                    ({groups.completed.length})
                  </span>
                </summary>
                <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {groups.completed.map((task) => (
                    <li key={task.id}>
                      <TaskCard task={task} onOpen={() => openTask(task.id)} />
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </>
        ) : (
          settings.members.length === 0 && (
            <p className="text-xs leading-6 text-base-content/65">
              Add a member in{" "}
              <Link className="font-semibold underline" href="/settings">
                Settings
              </Link>{" "}
              to use My Work.
            </p>
          )
        )}
      </div>
    </WorkspaceState>
  );
}
