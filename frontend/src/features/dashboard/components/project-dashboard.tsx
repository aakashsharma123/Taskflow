"use client";
import { m, type Variants } from "framer-motion";
import Link from "next/link";
import { useTaskStore } from "@/features/tasks/hooks/use-task-store";
import { summarizeProject } from "@/features/dashboard/lib/project-summary";
import { LoadError } from "@/shared/ui/load-error";
import { Lozenge } from "@/shared/ui/lozenge";
import { CompletionTrend } from "./completion-trend";
import { EpicProgress } from "./epic-progress";
import { AnimatedProgress } from "@/shared/ui/animated-progress";

const reveal: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

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
    <m.div
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.06 }}
      className="space-y-6"
    >
      <dl className="ui-panel grid grid-cols-2 overflow-hidden xl:grid-cols-4">
        {metrics.map((metric) => (
          <m.div
            key={metric.label}
            variants={reveal}
            className="relative border-line p-5 odd:border-r [&:nth-child(-n+2)]:border-b sm:p-6 xl:border-r xl:last:border-r-0 xl:[&:nth-child(-n+2)]:border-b-0"
          >
            <dt className="flex items-center gap-2 text-xs font-medium text-subtle">
              <span aria-hidden="true" className="text-subtlest">
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
              className="mt-4 text-4xl leading-none font-medium tracking-[-0.05em] tabular-nums"
              data-metric={metric.label}
            >
              {metric.value}
            </dd>
            <dd className="mt-2 text-[11px] text-subtlest">
              {metric.description}
            </dd>
          </m.div>
        ))}
      </dl>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        <m.section
          variants={reveal}
          className="ui-panel p-6 sm:p-7"
          aria-labelledby="project-pulse"
        >
          <h2 id="project-pulse" className="ui-section-title">
            Project completion
          </h2>
          <p className="mt-1.5 text-xs leading-5 text-subtle">
            {summary.highPriorityOpen} high-priority tasks still open ·{" "}
            {summary.archived} archived tasks
          </p>
          <p className="mt-8 text-[64px] leading-none font-medium tracking-[-0.07em] text-primary tabular-nums">
            {summary.completionRate}%
          </p>
          <AnimatedProgress
            className="mt-5 h-2 w-full text-primary"
            value={summary.completionRate}
            max={100}
            label="Project completion"
          />
          <p className="mt-2 text-xs text-subtle">
            {summary.completed} of {summary.total} tasks done
          </p>
          <Link href="/tasks" className="ui-button ui-button-primary mt-6">
            Continue on the board <span aria-hidden="true">↗</span>
          </Link>
        </m.section>
        <m.section
          variants={reveal}
          className="ui-panel p-6 sm:p-7"
          aria-labelledby="workflow-heading"
        >
          <h2 id="workflow-heading" className="ui-section-title">
            Status overview
          </h2>
          <p className="mt-1.5 text-xs leading-5 text-subtle">
            Tasks currently on Board, grouped by status.
          </p>
          <ul className="mt-7 space-y-5">
            {summary.statuses.map((status) => (
              <li key={status.status}>
                <div className="mb-1.5 flex items-center justify-between">
                  <Lozenge className={status.lozenge}>{status.label}</Lozenge>
                  <span className="text-sm font-semibold tabular-nums">
                    {status.count}
                  </span>
                </div>
                <AnimatedProgress
                  className="h-1.5 w-full text-primary"
                  value={status.count}
                  max={summary.board || 1}
                  label={`${status.label}: ${status.count} of ${summary.board} board tasks`}
                />
              </li>
            ))}
          </ul>
        </m.section>
        <m.div variants={reveal} className="[&>section]:h-full">
          <CompletionTrend history={history} tasks={tasks} today={today} />
        </m.div>
        <m.div variants={reveal} className="[&>section]:h-full">
          <EpicProgress epics={summary.epics} />
        </m.div>
      </div>
      <p className="text-[11px] text-subtlest">
        Overview uses tasks saved in this browser.
      </p>
    </m.div>
  );
}
