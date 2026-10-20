"use client";
import type { Sprint } from "../types/sprint";
import { useTaskStore } from "@/features/tasks/hooks/use-task-store";
import { useFlag } from "@/shared/components/flag-provider";
import { CreateSprintForm } from "./create-sprint-form";
import { SprintCard } from "./sprint-card";

const rank = { active: 0, planned: 1, completed: 2 };
const byRank = (a: Sprint, b: Sprint) =>
  rank[a.status] - rank[b.status] || b.id - a.id;

type SprintListProps = {
  disabled: boolean;
  onOpenTask: (id: number) => void;
};

function SprintCards({
  items,
  disabled,
  onOpenTask,
}: SprintListProps & { items: Sprint[] }) {
  const { tasks, epics, sprints, assignSprint, startSprint, completeSprint } =
    useTaskStore();
  const showFlag = useFlag();
  return (
    <div className="flex flex-col gap-4">
      {items.map((sprint) => (
        <SprintCard
          key={sprint.id}
          sprint={sprint}
          sprints={sprints}
          tasks={tasks}
          epics={epics}
          disabled={disabled}
          onOpenTask={onOpenTask}
          onAssign={assignSprint}
          onStart={(id) => {
            const result = startSprint(id);
            if (result.ok)
              showFlag({
                message: "Sprint started. Assigned work is now on Board.",
              });
            return result;
          }}
          onComplete={(id) => {
            const result = completeSprint(id);
            if (result.ok)
              showFlag({
                message:
                  "Sprint completed. Unfinished work returned to Backlog.",
              });
            return result;
          }}
        />
      ))}
    </div>
  );
}

export function OpenSprints({ disabled, onOpenTask }: SprintListProps) {
  const { sprints, createSprint } = useTaskStore();
  const showFlag = useFlag();
  const open = sprints
    .filter((sprint) => sprint.status !== "completed")
    .sort(byRank);
  return (
    <section aria-label="Sprints" className="mb-6">
      <CreateSprintForm
        disabled={disabled}
        onCreate={(input) => {
          const result = createSprint(input);
          if (result.ok)
            showFlag({
              message: "Sprint created. Add tasks to plan its scope.",
            });
          return result;
        }}
      />
      <SprintCards items={open} disabled={disabled} onOpenTask={onOpenTask} />
    </section>
  );
}

export function CompletedSprints({ disabled, onOpenTask }: SprintListProps) {
  const { sprints } = useTaskStore();
  const completed = sprints
    .filter((sprint) => sprint.status === "completed")
    .sort(byRank);
  if (completed.length === 0) return null;
  return (
    <details className="mt-6">
      <summary className="w-fit cursor-pointer py-1 font-semibold">
        Completed sprints ({completed.length})
      </summary>
      <div className="mt-3">
        <SprintCards
          items={completed}
          disabled={disabled}
          onOpenTask={onOpenTask}
        />
      </div>
    </details>
  );
}
