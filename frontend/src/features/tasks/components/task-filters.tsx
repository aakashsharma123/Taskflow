"use client";
import { useId } from "react";
import { taskColumns } from "@/features/tasks/constants/task-statuses";
import {
  defaultTaskFilters,
  hasTaskFilters,
  type TaskFilters,
  type TaskSort,
} from "@/features/tasks/lib/task-filters";
function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const id = useId();
  return (
    <div className="flex min-w-36 flex-1 flex-col gap-2">
      <label htmlFor={id} className="text-xs font-medium text-base-content/70">
        {label}
      </label>
      <select
        id={id}
        className="select select-sm h-10 w-full min-w-36 rounded-lg border-base-300 bg-base-100 text-xs"
        value={value}
        onChange={(event) => {
          const option = options.find(
            (option) => option.value === event.target.value,
          );
          if (option) onChange(option.value);
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
export function TaskFilterToolbar({
  filters,
  onChange,
  epics,
  assignees,
  labels,
}: {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  epics: string[];
  assignees: string[];
  labels: string[];
}) {
  return (
    <div className="mb-5 rounded-2xl border border-base-300/80 bg-base-100/70 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-44 flex-[2] flex-col gap-2">
          <span className="text-xs font-medium text-base-content/70">
            Search tasks
          </span>
          <input
            type="search"
            className="input input-sm h-10 w-full min-w-44 rounded-lg border-base-300 bg-base-100 text-xs"
            placeholder="Title or task ID…"
            value={filters.search}
            onChange={(event) =>
              onChange({ ...filters, search: event.target.value })
            }
          />
        </label>
        <FilterSelect
          label="Epic"
          value={filters.epic}
          options={[
            { value: "", label: "All epics" },
            ...epics.map((name) => ({ value: name, label: name })),
          ]}
          onChange={(epic) => onChange({ ...filters, epic })}
        />
        <FilterSelect<TaskSort>
          label="Sort by"
          value={filters.sort}
          options={[
            { value: "newest", label: "Newest first" },
            { value: "oldest", label: "Oldest first" },
            { value: "priority", label: "Highest priority" },
            { value: "title", label: "Title A–Z" },
            { value: "dueDate", label: "Due date" },
          ]}
          onChange={(sort) => onChange({ ...filters, sort })}
        />
        {hasTaskFilters(filters) && (
          <button
            type="button"
            className="btn btn-ghost btn-sm h-10 text-xs"
            onClick={() => onChange(defaultTaskFilters)}
          >
            Clear filters
          </button>
        )}
      </div>
      <details className="mt-4">
        <summary className="w-fit cursor-pointer py-1 text-xs font-medium">
          More filters
          {filters.assignee ||
          filters.priority ||
          filters.status ||
          filters.label ||
          filters.due
            ? " · active"
            : ""}
        </summary>
        <div className="mt-3 flex flex-wrap gap-3">
          <FilterSelect
            label="Label"
            value={filters.label}
            options={[
              { value: "", label: "All labels" },
              ...labels.map((label) => ({ value: label, label })),
            ]}
            onChange={(label) => onChange({ ...filters, label })}
          />
          <FilterSelect
            label="Due"
            value={filters.due}
            options={[
              { value: "", label: "Any date" },
              { value: "overdue", label: "Overdue" },
              { value: "today", label: "Due today" },
              { value: "none", label: "No date" },
            ]}
            onChange={(due) => onChange({ ...filters, due })}
          />
          <FilterSelect
            label="Assignee"
            value={filters.assignee}
            options={[
              { value: "", label: "All assignees" },
              { value: "unassigned", label: "Unassigned" },
              ...assignees.map((name) => ({ value: name, label: name })),
            ]}
            onChange={(assignee) => onChange({ ...filters, assignee })}
          />
          <FilterSelect
            label="Priority"
            value={filters.priority}
            options={[
              { value: "", label: "All priorities" },
              { value: "high", label: "High" },
              { value: "medium", label: "Medium" },
              { value: "low", label: "Low" },
            ]}
            onChange={(priority) => onChange({ ...filters, priority })}
          />
          <FilterSelect
            label="Status"
            value={filters.status}
            options={[
              { value: "", label: "All statuses" },
              ...taskColumns.map((column) => ({
                value: column.status,
                label: column.label,
              })),
            ]}
            onChange={(status) => onChange({ ...filters, status })}
          />
        </div>
      </details>
    </div>
  );
}
