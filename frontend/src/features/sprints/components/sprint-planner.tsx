"use client";
import { useState } from "react";
import Link from "next/link";
import { useTaskStore } from "@/features/tasks/hooks/use-task-store";
import { sampleTasks } from "@/features/tasks/data/sample-tasks";
import { CreateSprintForm } from "./create-sprint-form";
import { SprintCard } from "./sprint-card";
const rank = { active: 0, planned: 1, completed: 2 };
export function SprintPlanner() {
  const {
    tasks,
    sprints,
    ready,
    error,
    createSprint,
    assignSprint,
    startSprint,
    completeSprint,
    reload,
  } = useTaskStore(sampleTasks);
  const [notice, setNotice] = useState("");
  if (!ready)
    return (
      <p role="status" className="text-sm">
        Loading sprints…
      </p>
    );
  return (
    <div>
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl bg-rose-50 p-4 text-xs leading-6 text-rose-800"
        >
          {error}
          <button
            className="btn btn-ghost btn-sm ml-2"
            type="button"
            onClick={reload}
          >
            Try again
          </button>
        </div>
      )}
      <div className="mb-6 rounded-3xl border border-secondary/60 bg-secondary/20 p-6 sm:p-8">
        <p className="text-[10px] font-semibold tracking-widest uppercase">
          A focused next step
        </p>
        <h2 className="mt-3 text-2xl font-semibold">
          Give your next release a clear goal.
        </h2>
        <p className="mt-3 max-w-xl text-xs leading-6 text-base-content/75">
          Plan work from your backlog, run one sprint at a time, and carry
          unfinished tasks forward.
        </p>
        <Link
          href="/backlog"
          className="btn btn-primary mt-5 rounded-xl text-xs"
        >
          Open backlog
        </Link>
      </div>
      <p role="status" className="mb-4 text-xs text-teal-800">
        {notice}
      </p>
      <CreateSprintForm
        disabled={Boolean(error)}
        onCreate={(input) => {
          const result = createSprint(input);
          if (result.ok)
            setNotice(
              "Sprint created. Add tasks from Backlog to plan its scope.",
            );
          return result;
        }}
      />
      {sprints.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-base-300 p-8 text-sm text-base-content/65">
          No sprints yet. Create your first sprint above.
        </p>
      ) : (
        <div className="grid items-start gap-5 xl:grid-cols-2">
          {[...sprints]
            .sort((a, b) => rank[a.status] - rank[b.status] || b.id - a.id)
            .map((sprint) => (
              <SprintCard
                key={sprint.id}
                sprint={sprint}
                tasks={tasks}
                disabled={Boolean(error)}
                hasActive={sprints.some((sprint) => sprint.status === "active")}
                onAssign={assignSprint}
                onStart={(id) => {
                  const result = startSprint(id);
                  if (result.ok)
                    setNotice("Sprint started. Assigned work is now on Board.");
                  return result;
                }}
                onComplete={(id) => {
                  const result = completeSprint(id);
                  if (result.ok)
                    setNotice(
                      "Sprint completed. Unfinished work returned to Backlog.",
                    );
                  return result;
                }}
              />
            ))}
        </div>
      )}
      <p className="mt-5 text-[11px] text-base-content/60">
        Saved in this browser · Sprint dates describe the planned schedule.
      </p>
    </div>
  );
}
