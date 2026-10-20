"use client";
import Link from "next/link";
import { useTaskStore } from "@/features/tasks/hooks/use-task-store";
import { summarizeProject } from "@/features/dashboard/lib/project-summary";
import { LoadError } from "@/shared/ui/load-error";
import { Lozenge } from "@/shared/ui/lozenge";
import { CompletionTrend } from "./completion-trend";
import { EpicProgress } from "./epic-progress";

const metricIcons = {
  total: "M3 4h10M3 8h10M3 12h10",
  board: "M2 3h12v10H2zM6 3v10M10 3v10",
  backlog: "M5 4h9M5 8h9M5 12h9M2 4h.01M2 8h.01M2 12h.01",
  completed: "m3 8.5 3 3 7-7",
};

export function ProjectDashboard() {
  const { tasks, epics, history, ready, error, reload } = useTaskStore();
  if (!ready)
    return (
      <p role="status" className="text-subtle">
        Loading your project overview…
      </p>
    );
  if (error) return <LoadError message={error} onRetry={reload} />;
  const today = new Date().toISOString().slice(0, 10);
  const summary = summarizeProject(tasks, epics);
  const metrics = [
    {
      label: "Total tasks",
      value: summary.total,
      description: "Includes archived work",
      icon: metricIcons.total,
    },
    {
      label: "On the board",
      value: summary.board,
      description: "Ready and active work",
      icon: metricIcons.board,
    },
    {
      label: "In backlog",
      value: summary.backlog,
      description: "Ideas and parked tasks",
      icon: metricIcons.backlog,
    },
    {
      label: "Completed",
      value: summary.completed,
      description: "Includes archived work",
      icon: metricIcons.completed,
    },
  ];
  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="relative rounded-md border border-line py-4 pr-4 pl-17"
          >
            <dt className="font-medium">
              <span
                aria-hidden="true"
                className="absolute top-4 left-4 grid size-10 place-items-center rounded-full bg-tint-gray text-subtle"
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4"
                >
                  <path d={metric.icon} />
                </svg>
              </span>
              {metric.label}
            </dt>
            <dd
              className="text-2xl leading-8 font-semibold"
              data-metric={metric.label}
            >
              {metric.value}
            </dd>
            <dd className="text-xs text-subtle">{metric.description}</dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-4 xl:grid-cols-2">
        <section
          className="rounded-md border border-line p-5"
          aria-labelledby="project-pulse"
        >
          <h2 id="project-pulse" className="text-base font-semibold">
            Project completion
          </h2>
          <p className="mt-1 text-subtle">
            {summary.highPriorityOpen} high-priority tasks still open ·{" "}
            {summary.archived} archived tasks
          </p>
          <p className="mt-5 text-5xl leading-none font-semibold">
            {summary.completionRate}%
          </p>
          <progress
            className="progress mt-4 h-2 w-full text-icon-done"
            value={summary.completionRate}
            max={100}
            aria-label="Project completion"
          />
          <p className="mt-2 text-xs text-subtle">
            {summary.completed} of {summary.total} tasks done
          </p>
          <Link href="/tasks" className="ui-button mt-5">
            Open board
          </Link>
        </section>
        <section
          className="rounded-md border border-line p-5"
          aria-labelledby="workflow-heading"
        >
          <h2 id="workflow-heading" className="text-base font-semibold">
            Status overview
          </h2>
          <p className="mt-1 text-subtle">
            Tasks currently on Board, grouped by status.
          </p>
          <ul className="mt-5 space-y-4">
            {summary.statuses.map((status) => (
              <li key={status.status}>
                <div className="mb-1.5 flex items-center justify-between">
                  <Lozenge className={status.lozenge}>{status.label}</Lozenge>
                  <span className="font-semibold">{status.count}</span>
                </div>
                <progress
                  className="progress h-1.5 w-full text-primary"
                  value={status.count}
                  max={summary.board || 1}
                  aria-label={`${status.label}: ${status.count} of ${summary.board} board tasks`}
                />
              </li>
            ))}
          </ul>
        </section>
        <CompletionTrend history={history} tasks={tasks} today={today} />
        <EpicProgress epics={summary.epics} />
      </div>
      <p className="text-xs text-subtle">
        Overview uses tasks saved in this browser.
      </p>
    </div>
  );
}
