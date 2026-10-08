import Link from "next/link";
import type { Sprint } from "@/features/sprints/types/sprint";
export function SprintOutcomes({ sprints }: { sprints: Sprint[] }) {
  const completed = [...sprints]
    .flatMap((sprint) =>
      sprint.status === "completed" && sprint.summary
        ? [{ ...sprint, summary: sprint.summary }]
        : [],
    )
    .sort((a, b) => b.id - a.id);
  return (
    <section
      aria-labelledby="sprint-outcomes"
      className="rounded-2xl border border-base-300/80 bg-base-100 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="sprint-outcomes" className="text-sm font-semibold">
            Sprint outcomes
          </h2>
          <p className="mt-2 text-xs leading-6 text-base-content/65">
            Completion snapshots keep the original result as work moves forward.
          </p>
        </div>
        <Link href="/sprints" className="btn btn-ghost btn-sm text-xs">
          View sprints <span aria-hidden="true">↗</span>
        </Link>
      </div>
      {completed.length ? (
        <ul className="mt-5 space-y-3">
          {completed.map((sprint) => {
            const summary = sprint.summary;
            return (
              <li
                key={sprint.id}
                className="flex flex-wrap items-center gap-4 rounded-xl bg-workspace p-4"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/sprints#sprint-${sprint.id}`}
                    className="text-xs font-semibold [overflow-wrap:anywhere] hover:underline underline-offset-4"
                  >
                    {sprint.name}
                  </Link>
                  <p className="mt-2 text-[11px] text-base-content/65">
                    {summary.completed} completed · {summary.carried} carried to
                    Backlog · {summary.total} planned
                  </p>
                </div>
                <div className="w-28">
                  <p className="mb-2 text-right text-xs font-semibold">
                    {summary.total
                      ? Math.round((summary.completed / summary.total) * 100)
                      : 0}
                    %
                  </p>
                  <progress
                    className="progress progress-primary h-1.5 w-full"
                    value={summary.completed}
                    max={summary.total || 1}
                    aria-label={`${sprint.name} completed scope`}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-base-300 p-6 text-center">
          <p className="text-xs font-medium">
            Your first sprint result will appear here.
          </p>
          <p className="mt-2 text-[11px] leading-6 text-base-content/65">
            Complete a sprint to see its finished and carried work.
          </p>
        </div>
      )}
    </section>
  );
}
