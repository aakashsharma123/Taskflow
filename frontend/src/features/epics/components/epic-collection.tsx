import type { Task } from "@/features/tasks/types/task";
import { EpicIcon } from "@/features/tasks/components/task-icons";
import { Lozenge } from "@/shared/ui/lozenge";

const stateLozenges = {
  "Ready to plan": undefined,
  "Not started": undefined,
  "In motion": "bg-tint-blue text-tint-blue-text",
  Complete: "bg-tint-green text-tint-green-text",
};

export function EpicCollection({
  epics,
  tasks,
}: {
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
      <dl className="mb-6 grid grid-cols-3 divide-x divide-line overflow-hidden rounded-xl border border-line">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex min-w-0 flex-col px-4 py-3">
            <dt className="text-xs text-subtle">{metric.label}</dt>
            <dd className="order-first text-xl leading-7 font-semibold">
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>
      <h3 className="mb-2 text-xs font-semibold tracking-wide text-subtle uppercase">
        Progress by epic
      </h3>
      {groups.length ? (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
          {groups.map((group) => {
            const state =
              group.total === 0
                ? "Ready to plan"
                : group.completed === group.total
                  ? "Complete"
                  : group.active || group.completed > 0
                    ? "In motion"
                    : "Not started";
            return (
              <li key={group.name} className="px-4 py-3">
                <div className="mb-2 flex items-center gap-2">
                  <EpicIcon />
                  <p className="min-w-0 flex-1 font-semibold [overflow-wrap:anywhere]">
                    {group.name}
                  </p>
                  <Lozenge className={stateLozenges[state]}>{state}</Lozenge>
                </div>
                <div className="mb-1.5 flex justify-between gap-3 text-xs text-subtle">
                  <span>
                    {group.completed} of {group.total}{" "}
                    {group.total === 1 ? "task" : "tasks"} done
                  </span>
                  <span className="font-semibold">{group.percent}%</span>
                </div>
                <progress
                  className="progress h-1.5 w-full text-icon-done"
                  aria-label={`${group.name} completed tasks`}
                  max={group.total || 1}
                  value={group.completed}
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-subtle">
          Create your first epic to group related work.
        </p>
      )}
      <p className="mt-2 text-xs text-subtlest">
        Progress includes completed and archived tasks linked to each epic.
      </p>
    </section>
  );
}
