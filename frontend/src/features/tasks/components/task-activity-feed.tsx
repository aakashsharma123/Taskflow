import type { Task } from "../types/task";

export function TaskActivityFeed({ task }: { task: Task }) {
  return (
    <section aria-label={`ORB-${task.id} activity`}>
      <h3 className="text-base font-semibold">Activity</h3>
      <p className="mt-1 text-xs text-subtlest">
        Saved changes in this browser · Latest 100 events · Local user
      </p>
      {task.activity.length === 0 ? (
        <p className="mt-3 text-subtle">No recorded changes yet.</p>
      ) : (
        <ol className="mt-4 max-h-72 space-y-4 overflow-y-auto pr-2">
          {[...task.activity].reverse().map((entry) => (
            <li key={entry.id} className="flex gap-3">
              <span
                aria-hidden="true"
                className="grid size-8 shrink-0 place-items-center rounded-full bg-tint-gray text-subtle"
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="size-4"
                >
                  <circle cx="8" cy="8" r="6" />
                  <path d="M8 4.5V8l2.5 1.5" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="[overflow-wrap:anywhere]">{entry.message}</p>
                <time dateTime={entry.at} className="text-xs text-subtle">
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
