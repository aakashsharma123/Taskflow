import type { Task } from "@/features/tasks/types/task";
import type { DailySummary } from "@/features/dashboard/lib/workspace-history";
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
    <section
      className="rounded-2xl border border-base-300/80 bg-base-100 p-5 sm:p-6"
      aria-labelledby="trend-heading"
    >
      <h2 id="trend-heading" className="text-sm font-semibold">
        Completed tasks over time
      </h2>
      <p className="mt-2 text-xs leading-6 text-base-content/60">
        Last 7 days · UTC · Daily total includes archived work. Reopening or
        deleting tasks can lower it.
      </p>
      <div
        aria-hidden="true"
        className="mt-6 grid h-40 grid-cols-7 items-end gap-2 sm:gap-4"
      >
        {trend.map((day) => (
          <div
            key={day.date}
            className="flex h-full flex-col items-center justify-end gap-2"
          >
            <span className="text-[11px] font-medium">
              {day.completed ?? "—"}
            </span>
            <div
              className={`w-full max-w-10 rounded-t-lg ${day.completed === null ? "border border-dashed border-base-300" : "bg-secondary"}`}
              style={{
                height:
                  day.completed === null
                    ? "10%"
                    : `${Math.max(4, (day.completed / maxCompleted) * 65)}%`,
              }}
            />
            <span className="text-[9px] whitespace-nowrap text-base-content/65">
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
      <p className="mt-5 text-[11px] leading-6 text-base-content/60">
        History starts when you save a change. Days before the first record are
        unknown; unchanged days keep the last known total.
      </p>
    </section>
  );
}
