import type { Metadata } from "next";
import { TaskListIcon } from "@/shared/ui/task-list-icon";

export const metadata: Metadata = { title: "Tasks | TaskFlow" };

export default function TasksPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <p className="mb-4 flex items-center gap-2.5 text-[11px] font-medium tracking-[0.16em] text-primary uppercase">
        <span aria-hidden="true" className="h-px w-6 bg-primary" />A little
        clarity, every day
      </p>
      <h1 className="text-3xl font-semibold tracking-[-0.045em] text-balance sm:text-4xl sm:leading-tight">
        Your tasks, <span className="text-primary">in focus.</span>
      </h1>
      <p className="mt-3 max-w-lg text-sm leading-7 text-base-content/65">
        A clear home for your next steps. Make space for the work that matters.
      </p>

      <section
        aria-labelledby="task-list-heading"
        className="task-overview card mt-9 overflow-hidden border border-base-300 bg-base-100"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-base-300 px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-base-200 text-primary">
              <TaskListIcon className="size-5" />
            </span>
            <div>
              <h2 id="task-list-heading" className="text-sm font-semibold">
                Task overview
              </h2>
              <p className="mt-1 text-xs text-base-content/65">
                Good things start with a plan.
              </p>
            </div>
          </div>
          <span className="badge badge-outline gap-2 rounded-full border-primary/15 bg-primary/5 px-3 py-3 text-[11px] font-medium text-primary">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-primary"
            />
            Getting started
          </span>
        </div>
        <div className="empty-task-space flex flex-col items-center px-6 py-12 text-center sm:py-14">
          <div aria-hidden="true" className="task-illustration mb-7">
            <div className="illustration-orbit" />
            <div className="illustration-sheet illustration-sheet-back" />
            <div className="illustration-sheet">
              <div className="illustration-heading">
                <span />
                <span />
              </div>
              <span className="illustration-row">
                <span className="illustration-check" />
                <span />
              </span>
              <span className="illustration-row">
                <span className="illustration-check" />
                <span />
              </span>
              <span className="illustration-row">
                <span className="illustration-check illustration-check-empty" />
                <span />
              </span>
              <span className="illustration-tag" />
            </div>
            <span className="illustration-complete">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m5 12 4 4L19 6" />
              </svg>
            </span>
            <span className="illustration-spark illustration-spark-large">
              ✦
            </span>
            <span className="illustration-spark illustration-spark-small">
              ✦
            </span>
          </div>
          <h3 className="text-xl font-medium tracking-tight">
            Room for your next big idea.
          </h3>
          <p className="mt-3 max-w-sm text-sm leading-7 text-base-content/65">
            Your task list will live here. A little structure to turn your next
            steps into meaningful progress.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-base-300/70 bg-base-200/40 px-5 py-4 text-[11px] text-base-content/65">
          <span>Find your focus</span>
          <span
            aria-hidden="true"
            className="size-1 rounded-full bg-base-content/25"
          />
          <span>Make it happen</span>
          <span
            aria-hidden="true"
            className="hidden size-1 rounded-full bg-base-content/25 sm:block"
          />
          <span className="hidden sm:block">Enjoy the progress</span>
        </div>
      </section>
    </div>
  );
}
