"use client";

import { useState, type RefObject } from "react";
import { Menu } from "@ark-ui/react/menu";
import type { Task } from "@/features/tasks/types/task";
import type { SaveResult } from "@/features/tasks/store/task-store";
import { SectionMessage } from "@/shared/ui/section-message";

export type LifecycleAction = "archive" | "restore" | "delete";

export function TaskActionsMenu({
  task,
  onSelect,
}: {
  task: Task;
  onSelect: (action: LifecycleAction) => void;
}) {
  const keep = task.archived ? "restore" : "archive";
  return (
    <Menu.Root positioning={{ placement: "bottom-end", strategy: "fixed" }}>
      <Menu.Trigger asChild>
        <button
          type="button"
          aria-label={`ORB-${task.id} actions`}
          className="ui-button ui-button-subtle ui-button-icon"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="size-4"
          >
            <circle cx="3" cy="8" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="13" cy="8" r="1.5" />
          </svg>
        </button>
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content className="z-[60] min-w-40 rounded-xl border border-line bg-base-100 p-1.5 shadow-overlay outline-none">
          <Menu.Item
            value={keep}
            onSelect={() => onSelect(keep)}
            className="cursor-pointer rounded-lg px-3 py-2.5 data-highlighted:bg-hover"
          >
            {task.archived ? "Restore" : "Archive"}
          </Menu.Item>
          <Menu.Item
            value="delete"
            onSelect={() => onSelect("delete")}
            className="cursor-pointer rounded-lg px-3 py-2.5 text-danger-text data-highlighted:bg-hover"
          >
            Delete
          </Menu.Item>
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  );
}

const copy = {
  delete: {
    title: "Delete this task?",
    body: "This also deletes its subtasks. You can undo this change afterward.",
    confirm: "Delete",
  },
  archive: {
    title: "Archive this task?",
    body: "Its details will stay available in Archive.",
    confirm: "Archive",
  },
  restore: {
    title: "Restore this task?",
    body: "It returns to its previous location.",
    confirm: "Restore",
  },
};

export function TaskLifecycleConfirm({
  action,
  inSprint,
  confirmRef,
  onCancel,
  onConfirm,
}: {
  action: LifecycleAction;
  inSprint: boolean;
  confirmRef: RefObject<HTMLButtonElement | null>;
  onCancel: () => void;
  onConfirm: () => SaveResult;
}) {
  const [error, setError] = useState("");
  const text = copy[action];
  return (
    <SectionMessage tone={action === "delete" ? "error" : "warning"}>
      <h3 className="font-semibold">{text.title}</h3>
      <p className="mt-1">{text.body}</p>
      {action === "archive" && inSprint && (
        <p className="mt-1">
          Archiving removes this task from its sprint. You can assign it again
          after restoring.
        </p>
      )}
      <p className="mt-1 text-subtle">
        Unsaved form changes will be discarded.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          ref={confirmRef}
          type="button"
          className={`ui-button ${action === "delete" ? "ui-button-danger" : "ui-button-primary"}`}
          onClick={() => {
            const result = onConfirm();
            if (!result.ok) setError(result.error);
          }}
        >
          {text.confirm}
        </button>
        <button
          type="button"
          className="ui-button ui-button-subtle"
          onClick={onCancel}
        >
          Keep editing
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-danger-text">
          {error}
        </p>
      )}
    </SectionMessage>
  );
}
