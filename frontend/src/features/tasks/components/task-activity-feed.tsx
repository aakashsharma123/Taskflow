import type { Task } from "../types/task";

export function TaskActivityFeed({ task }: { task: Task }) {
  return (
    <section
      aria-label={`ORB-${task.id} activity`}
      className="border-t border-base-300/70 pt-5"
    >
      <h3 className="text-sm font-semibold">Activity</h3>
      <p className="mt-1 text-[11px] leading-5 text-base-content/60">
        Saved changes in this browser · Latest 100 events · Local user
      </p>
      {task.activity.length === 0 ? (
        <p className="mt-3 text-xs text-base-content/65">
          No recorded changes yet.
        </p>
      ) : (
        <ol className="mt-4 max-h-64 space-y-4 overflow-y-auto pr-2">
          {[...task.activity].reverse().map((entry) => (
            <li key={entry.id} className="flex gap-3">
              <span
                aria-hidden="true"
                className="mt-1.5 size-2 shrink-0 rounded-full bg-secondary"
              />
              <div className="min-w-0">
                <p className="text-xs leading-6 [overflow-wrap:anywhere]">
                  {entry.message}
                </p>
                <time
                  dateTime={entry.at}
                  className="text-[10px] text-base-content/60"
                >
                  {new Intl.DateTimeFormat("en", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(entry.at))}
                </time>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
