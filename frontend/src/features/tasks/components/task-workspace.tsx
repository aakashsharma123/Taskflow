"use client";

import { useRef, useState } from "react";
import { useWorkspace } from "@/features/workspace/components/workspace-provider";
import { CreateTaskDialog } from "@/features/tasks/components/create-task-dialog";
import { useTaskActions } from "./task-actions-provider";
import { TaskFilterToolbar } from "./task-filters";
import {
  defaultTaskFilters,
  filterTasks,
  hasTaskFilters,
} from "@/features/tasks/lib/task-filters";
import { KanbanBoard } from "./kanban-board";
import { TaskList } from "./task-list";
import { taskColumns } from "@/features/tasks/constants/task-statuses";

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
    ready,
    error,
    createTask,
    moveTask,
    setPlacement,
    reload,
  } = useWorkspace();
  const boardRef = useRef<HTMLDivElement>(null);
  const { openTask } = useTaskActions();
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [filters, setFilters] = useState(defaultTaskFilters);
  const assignees = settings.members;
  const eligibleTasks = tasks.filter((task) =>
    mode === "archive"
      ? task.archived
      : !task.archived && task.placement === mode,
  );
  const filteredTasks = filterTasks(eligibleTasks, filters);

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
    </div>
  );
}
