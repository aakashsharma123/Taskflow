"use client";
import type { Sprint } from "@/features/sprints/types/sprint";
import { useId, useState } from "react";
import { Portal } from "@ark-ui/react/portal";
import { Select, createListCollection } from "@ark-ui/react/select";
import { taskColumns } from "@/features/tasks/constants/task-statuses";
import { taskPriorities } from "@/features/tasks/constants/task-priorities";
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
  const collection = createListCollection({ items: options });
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? value;
  const active = value !== options[0].value;
  return (
    <Select.Root
      collection={collection}
      value={[value]}
      onValueChange={(details) => {
        const option = options.find(
          (option) => option.value === details.value[0],
        );
        if (option) onChange(option.value);
      }}
      positioning={{ placement: "bottom-start", sameWidth: false }}
    >
      <Select.Label className="sr-only">{label}</Select.Label>
      <Select.Control>
        <Select.Trigger
          className={`ui-button max-w-64 ${active ? "ui-button-selected" : ""}`}
        >
          <span aria-hidden="true" className="truncate">
            {active ? `${label}: ${selectedLabel}` : label}
          </span>
          <span className="sr-only">{selectedLabel}</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="size-4 shrink-0"
          >
            <path d="m4 6 4 4 4-4" />
          </svg>
        </Select.Trigger>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content className="z-50 max-h-72 min-w-48 overflow-y-auto rounded-xl border border-line bg-base-100 p-1.5 shadow-overlay outline-none">
            {options.map((option) => (
              <Select.Item
                key={option.value}
                item={option}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 data-highlighted:bg-hover data-[state=checked]:bg-selected data-[state=checked]:text-primary"
              >
                <Select.ItemText className="min-w-0 flex-1 [overflow-wrap:anywhere]">
                  {option.label}
                </Select.ItemText>
                <Select.ItemIndicator>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4"
                  >
                    <path d="m3.5 8.5 3 3 6-7" />
                  </svg>
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );
}

function AssigneeFilter({
  value,
  assignees,
  onChange,
}: {
  value: string;
  assignees: string[];
  onChange: (value: string) => void;
}) {
  return (
    <FilterSelect
      label="Assignee"
      value={value}
      options={[
        { value: "", label: "All assignees" },
        ...assignees.map((name) => ({ value: name, label: name })),
        { value: "unassigned", label: "Unassigned" },
      ]}
      onChange={onChange}
    />
  );
}

export function TaskFilterToolbar({
  filters,
  onChange,
  epics,
  assignees,
  labels,
  sprints,
  sprintFilter,
}: {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  epics: string[];
  assignees: string[];
  labels: string[];
  sprints: Sprint[];
  sprintFilter: boolean;
}) {
  const searchId = useId();
  const moreId = useId();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = [
    filters.epic,
    filters.label,
    sprintFilter && filters.sprint,
    filters.priority,
    filters.status,
    filters.due,
    filters.sort !== defaultTaskFilters.sort,
  ].filter(Boolean).length;
  return (
    <div className="flex min-w-0 basis-full flex-col gap-3 xl:flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-auto">
          <label htmlFor={searchId} className="sr-only">
            Search tasks by title or task ID
          </label>
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-subtle"
          >
            <circle cx="7" cy="7" r="4.5" />
            <path d="m10.5 10.5 3 3" />
          </svg>
          <input
            id={searchId}
            type="search"
            className="ui-field ui-field-compact w-full bg-panel-soft/50 pl-9 sm:w-60"
            placeholder="Search tasks"
            value={filters.search}
            onChange={(event) =>
              onChange({ ...filters, search: event.target.value })
            }
          />
        </div>
        <AssigneeFilter
          value={filters.assignee}
          assignees={assignees}
          onChange={(assignee) => onChange({ ...filters, assignee })}
        />
        <button
          type="button"
          aria-expanded={moreOpen}
          aria-controls={moreId}
          className={`ui-button ${moreActive ? "ui-button-selected" : ""}`}
          onClick={() => setMoreOpen((open) => !open)}
        >
          Filters{moreActive > 0 && ` (${moreActive})`}
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="size-3.5"
          >
            <path d="M2 4h12M4 8h8M6 12h4" />
          </svg>
        </button>
        {hasTaskFilters(filters) && (
          <button
            type="button"
            className="ui-button ui-button-subtle"
            onClick={() => onChange(defaultTaskFilters)}
          >
            Clear filters
          </button>
        )}
      </div>
      <div
        id={moreId}
        hidden={!moreOpen}
        className="flex flex-wrap items-center gap-2 border-t border-line pt-3"
      >
        <FilterSelect
          label="Epic"
          value={filters.epic}
          options={[
            { value: "", label: "All epics" },
            ...epics.map((name) => ({ value: name, label: name })),
          ]}
          onChange={(epic) => onChange({ ...filters, epic })}
        />
        <FilterSelect
          label="Label"
          value={filters.label}
          options={[
            { value: "", label: "All labels" },
            ...labels.map((label) => ({ value: label, label })),
          ]}
          onChange={(label) => onChange({ ...filters, label })}
        />
        {sprintFilter && (
          <FilterSelect
            label="Sprint"
            value={filters.sprint}
            options={[
              { value: "", label: "All sprints" },
              { value: "none", label: "No sprint" },
              ...sprints.map((sprint) => ({
                value: String(sprint.id),
                label: sprint.name,
              })),
            ]}
            onChange={(sprint) => onChange({ ...filters, sprint })}
          />
        )}
        <FilterSelect
          label="Priority"
          value={filters.priority}
          options={[{ value: "", label: "All priorities" }, ...taskPriorities]}
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
        <FilterSelect<TaskSort>
          label="Sort"
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
      </div>
    </div>
  );
}
