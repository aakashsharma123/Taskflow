import Link from "next/link";
import type { summarizeProject } from "@/features/dashboard/lib/project-summary";
export function EpicProgress({
  epics,
}: {
  epics: ReturnType<typeof summarizeProject>["epics"];
}) {
  return (
    <section
      className="rounded-2xl border border-base-300/80 bg-base-100 p-5 sm:p-6"
      aria-labelledby="epic-progress"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="epic-progress" className="text-sm font-semibold">
            Epic progress
          </h2>
          <p className="mt-2 text-xs text-base-content/60">
            All saved tasks, including archived work.
          </p>
        </div>
        <Link href="/epics" className="btn btn-ghost btn-sm text-xs">
          Plan next steps <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <ul className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {epics.map((epic) => (
          <li key={epic.name} className="rounded-xl bg-base-200/60 p-4">
            <h3 className="text-xs font-semibold [overflow-wrap:anywhere]">
              <Link
                className="hover:underline underline-offset-4"
                href={`/epics/${encodeURIComponent(epic.name)}`}
              >
                {epic.name}
              </Link>
            </h3>
            <p className="mt-2 text-[11px] text-base-content/65">
              {epic.completed} of {epic.total} tasks done · {epic.percent}%
            </p>
            <progress
              className="progress progress-primary mt-3 w-full"
              value={epic.percent}
              max={100}
              aria-label={`${epic.name} completion`}
            />
          </li>
        ))}
      </ul>
      {!epics.length && (
        <p className="mt-5 text-xs text-base-content/60">
          Create an epic in Epics to track a larger goal here.
        </p>
      )}
    </section>
  );
}
