"use client";

import { useRef, useState } from "react";
import { useTaskStore } from "@/features/tasks/hooks/use-task-store";
import { EpicsDialog } from "@/features/epics/components/epics-dialog";
import { CreateTaskDialog } from "@/features/tasks/components/create-task-dialog";
import { TaskDetailsDialog } from "@/features/tasks/components/task-details-dialog";
import { DragDropProvider } from "@dnd-kit/react";
import { DraggableTaskCard } from "@/features/tasks/components/draggable-task-card";
import { TaskCard } from "./task-card";
import { BoardColumn } from "@/features/tasks/components/board-column";
import {
  taskColumns,
  isTaskStatus,
} from "@/features/tasks/constants/task-statuses";
import type { Task } from "@/features/tasks/schemas/types/task";

export function TaskBoard({
  tasks: initialTasks,
  mode = "board",
}: {
  tasks: Task[];
  mode?: "board" | "archive";
}) {
  const {
    tasks,
    epics,
    ready,
    error,
    createTask,
    moveTask,
    setArchived,
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
  const [search, setSearch] = useState("");
  const [epic, setEpic] = useState("");
  const assignees = [
    ...new Set(
      [...initialTasks, ...tasks].flatMap((task) =>
        task.assignee ? [task.assignee] : [],
      ),
    ),
  ];
  const query = search.trim().toLowerCase();
  const eligibleTasks = tasks.filter((task) =>
    mode === "archive" ? task.archived : !task.archived,
  );
  const filteredTasks = eligibleTasks.filter(
    (task) =>
      (!epic || task.epic === epic) &&
      (!query ||
        task.title.toLowerCase().includes(query) ||
        `ORB-${task.id}`.toLowerCase().includes(query)),
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
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <label className="flex w-full flex-col gap-2 sm:w-64">
          <span className="text-xs font-medium text-base-content/70">
            Search tasks
          </span>
          <input
            type="search"
            className="input input-sm h-10 w-full rounded-md border-base-300 bg-base-200/60 text-xs"
            placeholder="Search by title or task ID…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <div className="flex min-w-0 flex-col gap-2">
          <label
            htmlFor="board-epic"
            className="text-xs font-medium text-base-content/70"
          >
            Epic
          </label>
          <select
            id="board-epic"
            className="select select-sm h-10 w-48 max-w-full rounded-md border-base-300 bg-base-100 text-xs"
            value={epic}
            onChange={(event) => setEpic(event.target.value)}
          >
            <option value="">All epics</option>
            {epics.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        {(search || epic) && (
          <button
            type="button"
            className="btn btn-ghost btn-sm h-10 text-xs"
            onClick={() => {
              setSearch("");
              setEpic("");
            }}
          >
            Clear filters
          </button>
        )}
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
        <CreateTaskDialog
          epics={epics}
          assignees={assignees}
          disabled={!ready || Boolean(error)}
          onCreate={(input) => {
            const result = createTask(input);
            if (result.ok) {
              setSearch("");
              setEpic("");
              setNotice("Task created and saved in this browser.");
            }
            return result;
          }}
        />
      </div>
      {mode === "archive" ? (
        <div
          role="region"
          aria-label="Archived tasks"
          tabIndex={0}
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onOpen={() => {
                setSelectedTaskId(task.id);
                setDetailsOpen(true);
              }}
            />
          ))}
          {!filteredTasks.length && (
            <p className="py-10 text-sm text-base-content/60">
              No archived tasks match this view.
            </p>
          )}
        </div>
      ) : (
        <DragDropProvider
          onDragEnd={(event) => {
            if (event.canceled) return;
            const { source, target } = event.operation;
            if (
              !source ||
              typeof source.id !== "number" ||
              !target ||
              !isTaskStatus(target.id)
            )
              return;
            const result = moveTask(source.id, target.id);
            setActionError(result.ok ? "" : result.error);
            if (result.ok)
              setNotice(
                `ORB-${source.id} moved to ${taskColumns.find((column) => column.status === target.id)?.label}.`,
              );
          }}
        >
          <div
            role="region"
            aria-label="Task board, scroll horizontally to see all columns"
            tabIndex={0}
            className="board-scroll overflow-x-auto rounded-lg pb-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            <div className="grid min-w-[1020px] grid-cols-4 items-stretch gap-4">
              {taskColumns.map((column) => {
                const items = filteredTasks.filter(
                  (task) => task.status === column.status,
                );
                return (
                  <BoardColumn key={column.status} status={column.status}>
                    <div className="flex items-center gap-2 px-1.5 pt-2 pb-4">
                      <span
                        aria-hidden="true"
                        className={`size-2 rounded-full ${column.dot}`}
                      />
                      <h2
                        id={`column-${column.status}`}
                        className="text-[11px] font-semibold tracking-wider text-base-content/75 uppercase"
                      >
                        {column.label}
                      </h2>
                      <span
                        aria-label={`${items.length} tasks`}
                        className="rounded bg-base-300/60 px-1.5 py-0.5 text-[10px] font-medium text-base-content/70"
                      >
                        {items.length}
                      </span>
                    </div>
                    {items.length ? (
                      <ul
                        aria-label={`${column.label} tasks`}
                        className="flex flex-col gap-3"
                      >
                        {items.map((task) => (
                          <li key={task.id}>
                            <DraggableTaskCard
                              disabled={!ready || Boolean(error)}
                              task={task}
                              onOpen={() => {
                                setSelectedTaskId(task.id);
                                setDetailsOpen(true);
                              }}
                            />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="rounded-md border border-dashed border-base-300 px-4 py-8 text-center text-xs leading-6 text-base-content/65">
                        {search || epic
                          ? "No matching tasks"
                          : "No tasks here yet"}
                      </p>
                    )}
                  </BoardColumn>
                );
              })}
            </div>
          </div>
        </DragDropProvider>
      )}
      <p className="mt-2 text-[11px] text-base-content/60">
        Saved in this browser · Starts with sample tasks.
      </p>
      <TaskDetailsDialog
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
