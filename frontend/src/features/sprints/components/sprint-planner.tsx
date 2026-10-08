"use client";
import { useState } from "react";
import Link from "next/link";
import { useWorkspace } from "@/features/workspace/components/workspace-provider";
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
  } = useWorkspace();
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-secondary/50 bg-secondary/15 p-5">
        <div>
          <p className="text-sm font-semibold">
            {sprints.find((sprint) => sprint.status === "active")?.name ??
              "Ready for your next sprint"}
          </p>
          <p className="mt-2 text-xs leading-6 text-base-content/65">
            {sprints.filter((sprint) => sprint.status === "planned").length}{" "}
            planned ·{" "}
            {sprints.filter((sprint) => sprint.status === "completed").length}{" "}
            completed · One active sprint at a time
          </p>
        </div>
        <Link
          href="/backlog"
          className="btn btn-outline btn-sm rounded-xl text-xs"
        >
          Plan from Backlog <span aria-hidden="true">↗</span>
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
