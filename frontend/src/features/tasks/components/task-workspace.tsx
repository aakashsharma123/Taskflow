"use client";

import { useRef, useState } from "react";
import { useTaskStore } from "@/features/tasks/hooks/use-task-store";
import { EpicsDialog } from "@/features/epics/components/epics-dialog";
import { CreateTaskDialog } from "@/features/tasks/components/create-task-dialog";
import { TaskDetailsDialog } from "@/features/tasks/components/task-details-dialog";
import { TaskFilterToolbar } from "./task-filters";
import {
  defaultTaskFilters,
  filterTasks,
  hasTaskFilters,
} from "@/features/tasks/lib/task-filters";
import { KanbanBoard } from "./kanban-board";
import { TaskList } from "./task-list";
import { taskColumns } from "@/features/tasks/constants/task-statuses";
import type { Task } from "@/features/tasks/types/task";

export function TaskWorkspace({
  tasks: initialTasks,
  mode = "board",
}: {
  tasks: Task[];
  mode?: "board" | "archive" | "backlog";
}) {
  const {
    tasks,
    epics,
    sprints,
    assignSprint,
    ready,
    error,
    createTask,
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
  } = useTaskStore(initialTasks);
  const boardRef = useRef<HTMLDivElement>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const selectedTask = tasks.find((task) => task.id === selectedTaskId);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [undo, setUndo] = useState<{
    id: number;
    action: "archive" | "restore" | "delete";
  } | null>(null);
  const [filters, setFilters] = useState(defaultTaskFilters);
  const assignees = [
    ...new Set(
      [...initialTasks, ...tasks].flatMap((task) =>
        task.assignee ? [task.assignee] : [],
      ),
    ),
  ];
  const eligibleTasks = tasks.filter((task) =>
    mode === "archive"
      ? task.archived
      : !task.archived && task.placement === mode,
  );
  const filteredTasks = filterTasks(eligibleTasks, filters);

  const openTask = (id: number) => {
    setSelectedTaskId(id);
    setDetailsOpen(true);
  };

  if (!ready)
    return (
      <p
        role="status"
        className="rounded-2xl border border-base-300 bg-base-100 p-6 text-sm text-base-content/65"
      >
        Loading your workspace…
      </p>
    );

  return (
    <div ref={boardRef}>
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs leading-6 text-rose-800"
        >
          {error}
          <button
            type="button"
            className="btn btn-ghost btn-sm ml-2"
            onClick={reload}
          >
            Try again
          </button>
        </div>
      )}
      {actionError && (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-800"
        >
          {actionError}
        </p>
      )}
      <p role="status" className="mb-3 text-xs text-teal-800">
        {notice}
        {undo && (
          <button
            type="button"
            className="btn btn-ghost btn-xs ml-2"
            onClick={() => {
              const result =
                undo.action === "delete"
                  ? restoreDeletedTask(undo.id)
                  : setArchived(undo.id, undo.action === "restore");
              setActionError(result.ok ? "" : result.error);
              if (result.ok) {
                setUndo(null);
                setNotice(`ORB-${undo.id} restored to its previous location.`);
              }
            }}
          >
            Undo
          </button>
        )}
      </p>
      <TaskFilterToolbar
        filters={filters}
        onChange={setFilters}
        epics={epics}
        assignees={assignees}
        labels={[...new Set(tasks.flatMap((task) => task.labels))].sort()}
        sprints={sprints}
      />
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <p
          role="status"
          className="pb-2 text-xs text-base-content/60 sm:ml-auto"
        >
          {filteredTasks.length} of {eligibleTasks.length} tasks
        </p>
        <EpicsDialog
          epics={epics}
          tasks={tasks}
          disabled={!ready || Boolean(error)}
          onCreate={createEpic}
        />
        {mode !== "archive" && (
          <CreateTaskDialog
            epics={epics}
            assignees={assignees}
            disabled={!ready || Boolean(error)}
            onCreate={(input) => {
              const result = createTask(
                input,
                mode === "backlog" ? "backlog" : "board",
              );
              if (result.ok) {
                setFilters(defaultTaskFilters);
                setNotice("Task created and saved in this browser.");
              }
              return result;
            }}
          />
        )}
      </div>
      {mode === "board" ? (
        <KanbanBoard
          tasks={filteredTasks}
          disabled={!ready || Boolean(error)}
          filtered={hasTaskFilters(filters)}
          onOpen={openTask}
          onMove={(id, status) => {
            const result = moveTask(id, status);
            setActionError(result.ok ? "" : result.error);
            if (result.ok)
              setNotice(
                `ORB-${id} moved to ${taskColumns.find((column) => column.status === status)?.label}.`,
              );
          }}
        />
      ) : (
        <TaskList
          tasks={filteredTasks}
          mode={mode}
          disabled={!ready || Boolean(error)}
          onOpen={openTask}
          onActivate={(id) => {
            const result = setPlacement(id, "board");
            setActionError(result.ok ? "" : result.error);
            if (result.ok) {
              setNotice(`ORB-${id} moved to Board.`);
              requestAnimationFrame(() =>
                boardRef.current
                  ?.querySelector<HTMLElement>('[role="region"]')
                  ?.focus(),
              );
            }
          }}
        />
      )}
      <p className="mt-2 text-[11px] text-base-content/60">
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
            setNotice(
              `ORB-${id} moved to ${placement === "board" ? "Board" : "Backlog"}.`,
            );
          return result;
        }}
        onLifecycle={(id, action) => {
          const result =
            action === "delete"
              ? deleteTask(id)
              : setArchived(id, action === "archive");
          if (result.ok) {
            setUndo({ id, action });
            setNotice(
              `ORB-${id} ${action === "delete" ? "deleted" : action === "archive" ? "archived" : "restored"}. You can undo this change.`,
            );
          }
          return result;
        }}
        onAddSubtask={addSubtask}
        onToggleSubtask={setSubtaskCompleted}
        onUpdate={(id, input) => {
          const result = updateTask(id, input);
          if (result.ok) setNotice("Task updated and saved in this browser.");
          return result;
        }}
      />
    </div>
  );
}
