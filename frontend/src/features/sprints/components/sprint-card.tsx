"use client";
import { useId, useState, type FormEvent } from "react";
import type { Sprint } from "../types/sprint";
import type { Task } from "@/features/tasks/types/task";
import type { SaveResult } from "@/features/workspace/store/workspace-store";
import { formatTaskDate } from "@/features/tasks/lib/task-dates";
import { sprintProgress } from "../lib/sprint-progress";

export function SprintCard({
  sprint,
  tasks,
  disabled,
  hasActive,
  onAssign,
  onStart,
  onComplete,
}: {
  sprint: Sprint;
  tasks: Task[];
  disabled: boolean;
  hasActive: boolean;
  onAssign: (taskId: number, sprintId: number | null) => SaveResult;
  onStart: (id: number) => SaveResult;
  onComplete: (id: number) => SaveResult;
}) {
  const id = useId();
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");
  const members = tasks.filter(
    (task) => task.sprintId === sprint.id && !task.archived,
  );
  const candidates = tasks.filter(
    (task) =>
      task.placement === "backlog" && !task.archived && task.sprintId === null,
  );
  const progress = sprintProgress(sprint, tasks);
  const report = (result: SaveResult) => {
    setError(result.ok ? "" : result.error);
    return result.ok;
  };
  function assign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const taskId = Number(new FormData(form).get("task"));
    if (!taskId) {
      setError("Choose a backlog task first.");
      return;
    }
    if (report(onAssign(taskId, sprint.id))) form.reset();
  }
  return (
    <article
      id={`sprint-${sprint.id}`}
      aria-labelledby={`${id}-title`}
      className={`rounded-2xl border bg-base-100 p-5 sm:p-6 ${sprint.status === "active" ? "border-secondary shadow-sm" : "border-base-300/80"}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id={`${id}-title`}
          className="text-lg font-semibold [overflow-wrap:anywhere]"
        >
          {sprint.name}
        </h2>
        <span
          className={`rounded-full px-3 py-1 text-[10px] font-semibold capitalize ${sprint.status === "active" ? "bg-secondary text-secondary-content" : "bg-base-200 text-base-content"}`}
        >
          {sprint.status}
        </span>
      </div>
      <p className="mt-2 text-[11px] text-base-content/60">
        <time dateTime={sprint.startDate}>
          {formatTaskDate(sprint.startDate)}
        </time>{" "}
        –{" "}
        <time dateTime={sprint.endDate}>{formatTaskDate(sprint.endDate)}</time>
      </p>
      {sprint.goal && (
        <p className="mt-3 text-xs leading-6 whitespace-pre-wrap [overflow-wrap:anywhere] text-base-content/75">
          {sprint.goal}
        </p>
      )}
      <div className="my-5">
        <div className="mb-2 flex justify-between text-xs">
          <span>
            {progress.completed} of {progress.total} completed
          </span>
          <span className="font-semibold">{progress.percent}%</span>
        </div>
        <progress
          aria-label={`${sprint.name} completion`}
          value={progress.completed}
          max={progress.total || 1}
          className="progress progress-primary h-2 w-full"
        />
      </div>
      {sprint.status === "completed" && (
        <p className="mb-4 rounded-xl bg-workspace p-3 text-xs leading-6">
          Completion snapshot · {progress.carried} unfinished{" "}
          {progress.carried === 1 ? "task returned" : "tasks returned"} to
          Backlog.
        </p>
      )}
      {members.length === 0 ? (
        <p className="my-4 text-xs text-base-content/60">
          {sprint.status === "completed"
            ? "No retained tasks in this sprint."
            : "No tasks assigned yet. Add work from Backlog below."}
        </p>
      ) : (
        <ul className="mb-4 divide-y divide-base-300/60">
          {members.map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="text-[10px] text-base-content/60">
                  ORB-{task.id} · {task.status.replaceAll("_", " ")}
                </p>
                <p className="mt-1 text-xs leading-6 [overflow-wrap:anywhere]">
                  {task.title}
                </p>
              </div>
              {sprint.status !== "completed" && (
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`Remove ORB-${task.id} from ${sprint.name}`}
                  className="btn btn-ghost btn-sm shrink-0 text-xs"
                  onClick={() => report(onAssign(task.id, null))}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {sprint.status !== "completed" && (
        <>
          <form
            aria-label={`Add task to ${sprint.name}`}
            onSubmit={assign}
            className="mb-5"
          >
            <label htmlFor={`${id}-task`} className="text-xs font-medium">
              Add a backlog task
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              <select
                id={`${id}-task`}
                name="task"
                defaultValue=""
                disabled={disabled || candidates.length === 0}
                className="select min-w-0 flex-1 rounded-xl border-base-300 text-xs"
              >
                <option value="">
                  {candidates.length
                    ? "Choose a task"
                    : "No unassigned backlog tasks"}
                </option>
                {candidates.map((task) => (
                  <option key={task.id} value={task.id}>
                    ORB-{task.id} · {task.title}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={disabled || candidates.length === 0}
                className="btn btn-outline rounded-xl text-xs"
              >
                Add task
              </button>
            </div>
          </form>
          {sprint.status === "planned" ? (
            <>
              <button
                type="button"
                disabled={disabled || hasActive || !members.length}
                className="btn btn-primary rounded-xl text-xs"
                onClick={() => report(onStart(sprint.id))}
              >
                Start sprint
              </button>
              <p className="mt-2 text-[11px] leading-5 text-base-content/60">
                {hasActive
                  ? "Complete the active sprint before starting another."
                  : "Starting moves assigned tasks to Board and keeps their statuses."}
              </p>
            </>
          ) : confirm ? (
            <div className="rounded-xl border border-secondary bg-workspace p-4">
              <p className="mb-3 text-xs leading-6">
                Complete this sprint? {progress.total - progress.completed}{" "}
                unfinished tasks will return to Backlog; their statuses and
                subtasks stay intact.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={disabled}
                  className="btn btn-primary rounded-xl text-xs"
                  onClick={() => {
                    if (report(onComplete(sprint.id))) setConfirm(false);
                  }}
                >
                  Confirm completion
                </button>
                <button
                  type="button"
                  className="btn btn-ghost rounded-xl text-xs"
                  onClick={() => setConfirm(false)}
                >
                  Keep sprint active
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={disabled}
              className="btn btn-primary rounded-xl text-xs"
              onClick={() => setConfirm(true)}
            >
              Complete sprint
            </button>
          )}
        </>
      )}
      {error && (
        <p role="alert" className="mt-3 text-xs leading-6 text-rose-800">
          {error}
        </p>
      )}
    </article>
  );
}
