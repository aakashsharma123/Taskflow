import Link from "next/link";
import { OrbitMark } from "@/shared/ui/orbit-mark";
import type { Task } from "@/features/tasks/types/task";

const colors = [
  "bg-violet-50 text-violet-800",
  "bg-orange-50 text-orange-900",
  "bg-teal-50 text-teal-800",
];

export function EpicCollection({
  epics,
  tasks,
  expanded = false,
}: {
  expanded?: boolean;
  epics: string[];
  tasks: Task[];
}) {
  const groups = epics.map((name) => {
    const items = tasks.filter((task) => task.epic === name);
    const completed = items.filter((task) => task.status === "done").length;
    return {
      name,
      total: items.length,
      completed,
      active: items.some(
        (task) => task.status === "in_progress" || task.status === "in_review",
      ),
      percent: items.length ? Math.round((completed / items.length) * 100) : 0,
    };
  });
  const total = groups.reduce((sum, group) => sum + group.total, 0);
  const completed = groups.reduce((sum, group) => sum + group.completed, 0);
  const metrics = [
    { label: "Project epics", value: epics.length },
    { label: "Linked tasks", value: total },
    { label: "Completed", value: completed },
  ];
  return (
    <section aria-label="Project epics">
      <dl className="mb-7 grid grid-cols-3 gap-2 rounded-2xl border border-secondary/35 bg-secondary/10 p-4 sm:p-5">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex min-w-0 flex-col">
            <dt className="text-[10px] leading-5 text-base-content/65">
              {metric.label}
            </dt>
            <dd className="order-first mb-1.5 text-2xl font-semibold tracking-tight">
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Your bigger picture</h3>
        <span className="text-[10px] text-base-content/65">
          {epics.length} {epics.length === 1 ? "goal" : "goals"}
        </span>
      </div>
      {groups.length ? (
        <ul
          className={
            expanded ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "space-y-3"
          }
        >
          {groups.map((group, index) => {
            const state =
              group.total === 0
                ? "Ready to plan"
                : group.completed === group.total
                  ? "Complete"
                  : group.active || group.completed > 0
                    ? "In motion"
                    : "Not started";
            return (
              <li
                key={group.name}
                className="rounded-2xl border border-base-300/80 bg-base-100 p-4 transition-colors hover:border-base-content/25 sm:p-5"
              >
                <div className="flex flex-wrap items-start gap-3">
                  <span
                    aria-hidden="true"
                    className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${colors[index % colors.length]}`}
                  >
                    <OrbitMark className="size-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-6 font-semibold [overflow-wrap:anywhere]">
                      <Link
                        className="rounded-sm hover:underline underline-offset-4"
                        href={`/epics/${encodeURIComponent(group.name)}`}
                      >
                        {group.name}{" "}
                        <span
                          aria-hidden="true"
                          className="text-base-content/40"
                        >
                          ↗
                        </span>
                      </Link>
                    </p>
                    <p className="mt-1 text-[10px] text-base-content/65">
                      {group.total}{" "}
                      {group.total === 1 ? "linked task" : "linked tasks"}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-medium ${state === "Complete" ? "bg-teal-50 text-teal-800" : "bg-base-200/70 text-base-content/65"}`}
                  >
                    {state}
                  </span>
                </div>
                <div className="mt-5 flex justify-between gap-3 text-[10px]">
                  <span className="text-base-content/65">
                    {group.completed} of {group.total} completed
                  </span>
                  <span className="font-semibold">{group.percent}%</span>
                </div>
                <progress
                  className="progress progress-primary mt-2 h-1.5 w-full"
                  aria-label={`${group.name} completed tasks`}
                  max={group.total || 1}
                  value={group.completed}
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-base-300 px-5 py-12 text-center">
          <OrbitMark className="mb-4 size-12 text-secondary" />
          <p className="text-sm font-semibold">
            Make room for your next big idea.
          </p>
          <p className="mt-2 max-w-64 text-xs leading-6 text-base-content/65">
            Create your first epic to bring related tasks together.
          </p>
        </div>
      )}
      <p className="mt-4 text-[10px] leading-5 text-base-content/65">
        Progress includes completed and archived tasks linked to each epic.
      </p>
    </section>
  );
}
