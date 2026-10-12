import Link from "next/link";
import type { summarizeProject } from "@/features/dashboard/lib/project-summary";
import { EpicIcon } from "@/features/tasks/components/task-icons";
export function EpicProgress({
  epics,
}: {
  epics: ReturnType<typeof summarizeProject>["epics"];
}) {
  return (
    <section
      className="rounded-md border border-line p-5"
      aria-labelledby="epic-progress"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="epic-progress" className="text-base font-semibold">
            Epic progress
          </h2>
          <p className="mt-1 text-subtle">
            All saved tasks, including archived work.
          </p>
        </div>
        <Link href="/backlog" className="ui-button ui-button-subtle">
          Plan next steps
        </Link>
      </div>
      <ul className="mt-5 space-y-4">
        {epics.map((epic) => (
          <li key={epic.name}>
            <div className="mb-1.5 flex items-center gap-2">
              <EpicIcon />
              <h3 className="min-w-0 flex-1 font-medium [overflow-wrap:anywhere]">
                {epic.name}
              </h3>
              <span className="shrink-0 text-xs text-subtle">
                {epic.completed} of {epic.total} done · {epic.percent}%
              </span>
            </div>
            <progress
              className="progress h-1.5 w-full text-icon-done"
              value={epic.percent}
              max={100}
              aria-label={`${epic.name} completion`}
            />
          </li>
        ))}
      </ul>
      {!epics.length && (
        <p className="mt-5 text-subtle">
          Create an epic on Board to track a larger goal here.
        </p>
      )}
    </section>
  );
}
