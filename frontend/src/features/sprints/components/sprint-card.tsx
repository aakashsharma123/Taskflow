"use client";
import { useId, useState, type FormEvent } from "react";
import type { Sprint } from "../types/sprint";
import type { Task } from "@/features/tasks/types/task";
import type { SaveResult } from "@/features/tasks/store/task-store";
import { formatTaskDate } from "@/features/tasks/lib/task-dates";
import { sprintProgress } from "../lib/sprint-progress";
import { taskSprintStatus } from "../lib/task-sprint-state";
import { TaskRow } from "@/features/tasks/components/task-row";
import { Lozenge } from "@/shared/ui/lozenge";
import { SectionMessage } from "@/shared/ui/section-message";

const statusLozenges = {
  planned: "bg-tint-gray text-tint-gray-text",
  active: "bg-tint-blue text-tint-blue-text",
  completed: "bg-tint-green text-tint-green-text",
} satisfies Record<Sprint["status"], string>;

export function SprintCard({
  sprint,
  sprints,
  tasks,
  epics,
  disabled,
  onOpenTask,
  onAssign,
  onStart,
  onComplete,
}: {
  sprint: Sprint;
  sprints: Sprint[];
  tasks: Task[];
  epics: string[];
  disabled: boolean;
  onOpenTask: (id: number) => void;
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
      !task.archived &&
      task.sprintId !== sprint.id &&
      taskSprintStatus(task, sprints) !== "completed",
  );
  const hasActive = sprints.some((item) => item.status === "active");
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
  const startHint = hasActive
    ? "Complete the active sprint before starting another."
    : "Starting moves assigned tasks to Board and keeps their statuses.";
  return (
    <article
      aria-labelledby={`${id}-title`}
      className={`ui-panel overflow-hidden border ${sprint.status === "active" ? "border-primary" : "border-line"}`}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 bg-panel-soft px-5 py-4">
        <h2
          id={`${id}-title`}
          className="font-semibold [overflow-wrap:anywhere]"
        >
          {sprint.name}
        </h2>
        <span className="text-subtle">
          <time dateTime={sprint.startDate}>
            {formatTaskDate(sprint.startDate)}
          </time>{" "}
          –{" "}
          <time dateTime={sprint.endDate}>
            {formatTaskDate(sprint.endDate)}
          </time>
        </span>
        <span className="text-subtle">
          ({members.length} {members.length === 1 ? "task" : "tasks"})
        </span>
        <span className="ml-auto flex items-center gap-2">
          <Lozenge className={statusLozenges[sprint.status]}>
            {sprint.status}
          </Lozenge>
          {sprint.status === "planned" && (
            <button
              type="button"
              disabled={disabled || hasActive || !members.length}
              className="ui-button ui-button-primary"
              onClick={() => report(onStart(sprint.id))}
            >
              Start sprint
            </button>
          )}
          {sprint.status === "active" && !confirm && (
            <button
              type="button"
              disabled={disabled}
              className="ui-button"
              onClick={() => setConfirm(true)}
            >
              Complete sprint
            </button>
          )}
        </span>
      </div>
      <div className="space-y-4 px-5 py-5">
        {sprint.goal && (
          <p className="whitespace-pre-wrap text-subtle [overflow-wrap:anywhere]">
            {sprint.goal}
          </p>
        )}
        <div>
          <div className="mb-1 flex justify-between text-xs text-subtle">
            <span>
              {progress.completed} of {progress.total} completed
            </span>
            <span className="font-semibold">{progress.percent}%</span>
          </div>
          <progress
            aria-label={`${sprint.name} completion`}
            value={progress.completed}
            max={progress.total || 1}
            className="progress h-1.5 w-full text-icon-done"
          />
        </div>
        {sprint.status === "completed" && (
          <SectionMessage tone="information">
            Completion snapshot · {progress.carried} unfinished{" "}
            {progress.carried === 1 ? "task returned" : "tasks returned"} to
            Backlog.
          </SectionMessage>
        )}
        {sprint.status === "active" && confirm && (
          <SectionMessage tone="warning">
            <p>
              Complete this sprint? {progress.total - progress.completed}{" "}
              unfinished tasks will return to Backlog; their statuses and
              subtasks stay intact.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={disabled}
                className="ui-button ui-button-primary"
                onClick={() => {
                  if (report(onComplete(sprint.id))) setConfirm(false);
                }}
              >
                Confirm completion
              </button>
              <button
                type="button"
                className="ui-button ui-button-subtle"
                onClick={() => setConfirm(false)}
              >
                Keep sprint active
              </button>
            </div>
          </SectionMessage>
        )}
      </div>
      {members.length === 0 ? (
        <p className="border-t border-line px-4 py-4 text-subtle">
          {sprint.status === "completed"
            ? "No retained tasks in this sprint."
            : "No tasks yet. Add one below."}
        </p>
      ) : (
        <ul className="divide-y divide-line border-t border-line">
          {members.map((task) => (
            <li key={task.id}>
              <TaskRow
                task={task}
                epics={epics}
                onOpen={() => onOpenTask(task.id)}
                action={
                  sprint.status !== "completed" && (
                    <button
                      type="button"
                      disabled={disabled}
                      aria-label={`Remove ORB-${task.id} from ${sprint.name}`}
                      className="ui-button ui-button-subtle ui-button-compact"
                      onClick={() => report(onAssign(task.id, null))}
                    >
                      Remove
                    </button>
                  )
                }
              />
            </li>
          ))}
        </ul>
      )}
      {sprint.status !== "completed" && (
        <form
          aria-label={`Add task to ${sprint.name}`}
          onSubmit={assign}
          className="border-t border-line px-4 py-3"
        >
          <label
            htmlFor={`${id}-task`}
            className="mb-1 block text-xs font-semibold text-subtle"
          >
            Add a task
          </label>
          <div className="flex flex-wrap gap-2">
            <select
              id={`${id}-task`}
              name="task"
              defaultValue=""
              disabled={disabled || candidates.length === 0}
              className="ui-field ui-field-compact min-w-0 flex-1 sm:max-w-md"
            >
              <option value="">
                {candidates.length ? "Choose a task" : "No tasks to add"}
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
              className="ui-button"
            >
              Add task
            </button>
          </div>
          {sprint.status === "planned" && (
            <p className="mt-2 text-xs text-subtlest">{startHint}</p>
          )}
        </form>
      )}
      {error && (
        <p role="alert" className="px-4 pb-3 text-sm text-danger-text">
          {error}
        </p>
      )}
    </article>
  );
}
