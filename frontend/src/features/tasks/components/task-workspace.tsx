"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useTaskStore } from "@/features/tasks/hooks/use-task-store";
import { EpicsDialog } from "@/features/epics/components/epics-dialog";
import { TaskDetailsDialog } from "@/features/tasks/components/task-details-dialog";
import { TaskFilterToolbar } from "./task-filters";
import {
  defaultTaskFilters,
  filterTasks,
  hasTaskFilters,
} from "@/features/tasks/lib/task-filters";
import { KanbanBoard } from "./kanban-board";
import { TaskList } from "./task-list";
import { taskColumn } from "@/features/tasks/constants/task-statuses";
import { useFlag } from "@/shared/components/flag-provider";
import { SectionMessage } from "@/shared/ui/section-message";
import { LoadError } from "@/shared/ui/load-error";
import {
  CompletedSprints,
  OpenSprints,
} from "@/features/sprints/components/sprint-planner";
import { taskSprintStatus } from "@/features/sprints/lib/task-sprint-state";

export function TaskWorkspace({
  mode = "board",
}: {
  mode?: "board" | "archive" | "backlog";
}) {
  const {
    tasks,
    epics,
    settings,
    sprints,
    assignSprint,
    ready,
    error,
    moveTask,
    setArchived,
    setPlacement,
    deleteTask,
    restoreDeletedTask,
    updateTask,
    createEpic,
    addSubtask,
    setSubtaskCompleted,
    reload,
  } = useTaskStore();
  const showFlag = useFlag();
  const boardRef = useRef<HTMLDivElement>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const selectedTask = tasks.find((task) => task.id === selectedTaskId);
  const [actionError, setActionError] = useState("");
  const [filters, setFilters] = useState(defaultTaskFilters);
  const assignees = settings.members;
  const disabled = !ready || Boolean(error);
  const eligibleTasks = tasks.filter((task) => {
    if (mode === "archive") return task.archived;
    if (task.archived || task.placement !== mode) return false;
    return mode === "board" || taskSprintStatus(task, sprints) !== "planned";
  });
  const filteredTasks = filterTasks(eligibleTasks, filters);
  const archivedCount = tasks.filter((task) => task.archived).length;

  const openTask = (id: number) => {
    setSelectedTaskId(id);
    setDetailsOpen(true);
  };

  if (!ready)
    return (
      <p role="status" className="text-xs text-subtlest tabular-nums">
        Loading your workspace…
      </p>
    );

  return (
    <div ref={boardRef}>
      {error && <LoadError message={error} onRetry={reload} className="mb-5" />}
      {actionError && (
        <SectionMessage tone="error" role="alert" className="mb-4">
          {actionError}
        </SectionMessage>
      )}
      {mode === "backlog" && (
        <OpenSprints disabled={disabled} onOpenTask={openTask} />
      )}
      <div className="ui-panel mb-6 flex flex-wrap items-start gap-x-4 gap-y-3 p-3 sm:p-4">
        <TaskFilterToolbar
          filters={filters}
          onChange={setFilters}
          epics={epics}
          assignees={assignees}
          labels={[...new Set(tasks.flatMap((task) => task.labels))].sort()}
          sprints={sprints}
          sprintFilter={mode !== "backlog"}
        />
        <div className="ml-auto flex min-h-10 items-center gap-3">
          <p role="status" className="text-xs text-subtlest tabular-nums">
            {filteredTasks.length} of {eligibleTasks.length} tasks
          </p>
          <EpicsDialog
            epics={epics}
            tasks={tasks}
            disabled={disabled}
            onCreate={createEpic}
          />
        </div>
      </div>
      {mode === "board" ? (
        <KanbanBoard
          tasks={filteredTasks}
          epics={epics}
          disabled={disabled}
          filtered={hasTaskFilters(filters)}
          onOpen={openTask}
          onMove={(id, status) => {
            const result = moveTask(id, status);
            setActionError(result.ok ? "" : result.error);
            if (result.ok)
              showFlag({
                message: `ORB-${id} moved to ${taskColumn(status).label}.`,
              });
          }}
        />
      ) : (
        <TaskList
          tasks={filteredTasks}
          epics={epics}
          mode={mode}
          disabled={disabled}
          onOpen={openTask}
          onActivate={(id) => {
            const result = setPlacement(id, "board");
            setActionError(result.ok ? "" : result.error);
            if (result.ok) {
              showFlag({ message: `ORB-${id} moved to Board.` });
              requestAnimationFrame(() =>
                boardRef.current
                  ?.querySelector<HTMLElement>('[role="region"]')
                  ?.focus(),
              );
            }
          }}
        />
      )}
      {mode === "backlog" && (
        <>
          <CompletedSprints disabled={disabled} onOpenTask={openTask} />
          <p className="mt-4">
            <Link
              href="/tasks/archive"
              className="text-primary hover:underline"
            >
              View archived tasks ({archivedCount})
            </Link>
          </p>
        </>
      )}
      <p className="mt-4 text-[11px] text-subtlest">
        Saved in this browser · Starts with sample tasks.
      </p>
      <TaskDetailsDialog
        sprints={sprints}
        onAssignSprint={assignSprint}
        task={selectedTask}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        epics={epics}
        assignees={assignees}
        finalFocusEl={() =>
          boardRef.current?.querySelector<HTMLButtonElement>(
            `[data-task-id="${selectedTaskId}"]`,
          ) ??
          boardRef.current?.querySelector<HTMLElement>('[role="region"]') ??
          null
        }
        onPlacement={(id, placement) => {
          const result = setPlacement(id, placement);
          if (result.ok)
            showFlag({
              message: `ORB-${id} moved to ${placement === "board" ? "Board" : "Backlog"}.`,
            });
          return result;
        }}
        onLifecycle={(id, action) => {
          const result =
            action === "delete"
              ? deleteTask(id)
              : setArchived(id, action === "archive");
          if (result.ok)
            showFlag({
              message: `ORB-${id} ${action === "delete" ? "deleted" : action === "archive" ? "archived" : "restored"}. You can undo this change.`,
              action: {
                label: "Undo",
                onClick: () => {
                  const undone =
                    action === "delete"
                      ? restoreDeletedTask(id)
                      : setArchived(id, action === "restore");
                  showFlag(
                    undone.ok
                      ? {
                          message: `ORB-${id} restored to its previous location.`,
                        }
                      : { message: undone.error, tone: "error" },
                  );
                },
              },
            });
          return result;
        }}
        onAddSubtask={addSubtask}
        onToggleSubtask={setSubtaskCompleted}
        onUpdate={(id, input) => {
          const result = updateTask(id, input);
          if (result.ok)
            showFlag({ message: "Task updated and saved in this browser." });
          return result;
        }}
      />
    </div>
  );
}
