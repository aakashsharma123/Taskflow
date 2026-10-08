"use client";

import { useRef, useState } from "react";
import { useTaskStore } from "@/features/tasks/hooks/use-task-store";
import { CreateTaskDialog } from "@/features/tasks/components/create-task-dialog";
import { TaskDetailsDialog } from "@/features/tasks/components/task-details-dialog";
import { TaskCard } from "@/features/tasks/components/task-card";
import type { Task, TaskStatus } from "@/features/tasks/types/task";

const columns = [
  { status: "todo", label: "To do", dot: "bg-slate-400" },
  { status: "in_progress", label: "In progress", dot: "bg-primary" },
  { status: "in_review", label: "In review", dot: "bg-violet-500" },
  { status: "done", label: "Done", dot: "bg-emerald-500" },
] satisfies { status: TaskStatus; label: string; dot: string }[];

export function TaskBoard({ tasks: initialTasks }: { tasks: Task[] }) {
  const { tasks, ready, error, createTask, updateTask, reload } =
    useTaskStore(initialTasks);
  const boardRef = useRef<HTMLDivElement>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const selectedTask = tasks.find((task) => task.id === selectedTaskId);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [epic, setEpic] = useState("");
  const epics = [
    ...new Set(tasks.flatMap((task) => (task.epic ? [task.epic] : []))),
  ];
  const assignees = [
    ...new Set(tasks.flatMap((task) => (task.assignee ? [task.assignee] : []))),
  ];
  const query = search.trim().toLowerCase();
  const filteredTasks = tasks.filter(
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
      <p role="status" className="mb-3 text-xs text-teal-800">
        {notice}
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
          {filteredTasks.length} of {tasks.length} tasks
        </p>
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
      <div
        role="region"
        aria-label="Task board, scroll horizontally to see all columns"
        tabIndex={0}
        className="board-scroll overflow-x-auto rounded-lg pb-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <div className="grid min-w-[1020px] grid-cols-4 items-stretch gap-4">
          {columns.map((column) => {
            const items = filteredTasks.filter(
              (task) => task.status === column.status,
            );
            return (
              <section
                key={column.status}
                aria-labelledby={`column-${column.status}`}
                className="min-h-[520px] rounded-lg bg-base-200 p-2.5"
              >
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
                        <TaskCard
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
                    {search || epic ? "No matching tasks" : "No tasks here yet"}
                  </p>
                )}
              </section>
            );
          })}
        </div>
      </div>
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
        onUpdate={(id, input) => {
          const result = updateTask(id, input);
          if (result.ok) setNotice("Task updated and saved in this browser.");
          return result;
        }}
      />
    </div>
  );
}
