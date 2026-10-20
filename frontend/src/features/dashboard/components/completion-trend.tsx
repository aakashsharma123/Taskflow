import type { Task } from "@/features/tasks/types/task";
import type { DailySummary } from "@/features/tasks/store/workspace-history";
import { completionTrend } from "@/features/dashboard/lib/project-summary";
export function CompletionTrend({
  history,
  tasks,
  today,
}: {
  history: DailySummary[];
  tasks: Task[];
  today: string;
}) {
  const trend = completionTrend(history, tasks, today);
  const maxCompleted = Math.max(1, ...trend.map((day) => day.completed ?? 0));
  return (
    <section className="ui-panel p-6 sm:p-7" aria-labelledby="trend-heading">
      <h2 id="trend-heading" className="ui-section-title">
        Completed tasks over time
      </h2>
      <p className="mt-1.5 text-xs leading-5 text-subtle">
        Last 7 days · UTC · Daily total includes archived work. Reopening or
        deleting tasks can lower it.
      </p>
      <div
        aria-hidden="true"
        className="mt-8 grid h-44 grid-cols-7 items-end gap-2"
      >
        {trend.map((day) => (
          <div
            key={day.date}
            className="flex h-full flex-col items-center justify-end gap-2"
          >
            <span className="text-xs font-medium tabular-nums">
              {day.completed ?? "—"}
            </span>
            <div
              className={`w-full max-w-7 rounded-t-md ${day.completed === null ? "border border-dashed border-line-input" : "bg-primary"}`}
              style={{
                height:
                  day.completed === null
                    ? "10%"
                    : `${Math.max(4, (day.completed / maxCompleted) * 65)}%`,
              }}
            />
            <span className="text-[11px] whitespace-nowrap text-subtle">
              {day.date.slice(5)}
            </span>
          </div>
        ))}
      </div>
      <div className="sr-only">
        <table>
          <caption>
            Daily completed task totals for the last seven days, UTC
          </caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Completed tasks</th>
            </tr>
          </thead>
          <tbody>
            {trend.map((day) => (
              <tr key={day.date}>
                <th scope="row">{day.date}</th>
                <td>{day.completed ?? "No recorded data"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-5 text-[11px] leading-5 text-subtlest">
        History starts when you save a change. Days before the first record are
        unknown; unchanged days keep the last known total.
      </p>
    </section>
  );
}
