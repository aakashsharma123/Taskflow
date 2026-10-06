"use client";
import Link from "next/link";
import { useWorkspace } from "@/features/workspace/components/workspace-provider";
import { summarizeProject } from "@/features/dashboard/lib/project-summary";
import { CompletionTrend } from "./completion-trend";
import { EpicProgress } from "./epic-progress";
export function ProjectDashboard() {
  const { tasks, epics, history, ready, error, reload } = useWorkspace();
  if (!ready)
    return (
      <p
        role="status"
        className="rounded-2xl border border-base-300 bg-base-100 p-6 text-sm text-base-content/65"
      >
        Loading your project overview…
      </p>
    );
  if (error)
    return (
      <div
        role="alert"
        className="rounded-2xl bg-rose-50 p-5 text-xs leading-6 text-rose-800"
      >
        {error}
        <button
          type="button"
          className="btn btn-ghost btn-sm ml-2"
          onClick={reload}
        >
          Try again
        </button>
      </div>
    );
  const today = new Date().toISOString().slice(0, 10);
  const summary = summarizeProject(tasks, epics);
  const metrics = [
    {
      label: "Total tasks",
      value: summary.total,
      description: "Includes archived work",
    },
    {
      label: "On the board",
      value: summary.board,
      description: "Ready and active work",
    },
    {
      label: "In backlog",
      value: summary.backlog,
      description: "Ideas and parked tasks",
    },
    {
      label: "Completed",
      value: summary.completed,
      description: "Includes archived work",
    },
  ];
  return (
    <div className="space-y-6">
      <section
        className="flex flex-wrap items-center justify-between gap-5 rounded-3xl border border-secondary/60 bg-secondary/25 p-6 sm:p-8"
        aria-labelledby="project-pulse"
      >
        <div>
          <p className="mb-2 text-[10px] font-semibold tracking-widest uppercase text-base-content/60">
            Project pulse
          </p>
          <h2 id="project-pulse" className="text-xl font-semibold">
            A clear view of your next move.
          </h2>
          <p className="mt-3 text-xs leading-6 text-base-content/70">
            {summary.highPriorityOpen} high-priority tasks still open ·{" "}
            {summary.archived} archived tasks
          </p>
          <Link
            href="/tasks"
            className="btn btn-primary btn-sm mt-4 rounded-xl"
          >
            Open board <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="min-w-36 rounded-2xl bg-base-100/80 p-5">
          <p className="text-xs text-base-content/65">Project completion</p>
          <p className="my-2 text-4xl font-semibold tracking-tight">
            {summary.completionRate}%
          </p>
          <progress
            className="progress progress-primary w-36"
            value={summary.completionRate}
            max={100}
            aria-label="Project completion"
          />
          <p className="mt-2 text-[11px] text-base-content/60">
            {summary.completed} of {summary.total} tasks done
          </p>
        </div>
      </section>
      <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-base-300/80 bg-base-100 p-4 sm:p-5"
          >
            <dt className="text-xs font-medium text-base-content/65">
              {metric.label}
            </dt>
            <dd
              className="mt-3 text-3xl font-semibold"
              data-metric={metric.label}
            >
              {metric.value}
            </dd>
            <dd className="mt-2 text-[10px] leading-5 text-base-content/60">
              {metric.description}
            </dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-6 xl:grid-cols-[1fr_1.3fr]">
        <section
          className="rounded-2xl border border-base-300/80 bg-base-100 p-5 sm:p-6"
          aria-labelledby="workflow-heading"
        >
          <h2 id="workflow-heading" className="text-sm font-semibold">
            Board workflow
          </h2>
          <p className="mt-2 text-xs leading-6 text-base-content/60">
            Tasks currently on Board, grouped by status.
          </p>
          <ul className="mt-5 space-y-5">
            {summary.statuses.map((status) => (
              <li key={status.status}>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={`size-2 rounded-full ${status.dot}`}
                    />
                    {status.label}
                  </span>
                  <span className="font-semibold">{status.count}</span>
                </div>
                <progress
                  className="progress progress-primary w-full"
                  value={status.count}
                  max={summary.board || 1}
                  aria-label={`${status.label}: ${status.count} of ${summary.board} board tasks`}
                />
              </li>
            ))}
          </ul>
        </section>
        <CompletionTrend history={history} tasks={tasks} today={today} />
      </div>
      <EpicProgress epics={summary.epics} />
      <p className="text-[11px] text-base-content/60">
        Overview uses tasks saved in this browser.
      </p>
    </div>
  );
}
