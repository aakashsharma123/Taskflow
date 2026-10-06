"use client";

import { Tabs } from "@ark-ui/react/tabs";
import { TaskDiscussion } from "./task-discussion";
import { TaskSprintAction } from "@/features/sprints/components/task-sprint-action";
import type { Sprint } from "@/features/sprints/types/sprint";
import { TaskActivityFeed } from "./task-activity-feed";
import { useRef } from "react";
import { Dialog } from "@ark-ui/react/dialog";
import { DialogPanel } from "@/shared/ui/dialog-panel";
import { SubtaskList } from "@/features/tasks/components/subtask-list";
import { TaskPlacementAction } from "./task-placement-action";
import { TaskLifecycleActions } from "./task-lifecycle-actions";
import { TaskForm } from "@/features/tasks/components/task-form";
import type { Task, TaskPlacement } from "@/features/tasks/types/task";
import type { CreateTaskInput } from "@/features/tasks/schemas/create-task-schema";
import type { SaveResult } from "@/features/tasks/store/task-store";

type TaskDetailsDialogProps = {
  task: Task | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  finalFocusEl: () => HTMLElement | null;
  epics: string[];
  sprints: Sprint[];
  onAssignSprint: (taskId: number, sprintId: number | null) => SaveResult;
  assignees: string[];
  onPlacement: (id: number, placement: TaskPlacement) => SaveResult;
  onLifecycle: (
    id: number,
    action: "archive" | "restore" | "delete",
  ) => SaveResult;
  onUpdate: (id: number, input: CreateTaskInput) => SaveResult;
  onAddSubtask: (id: number, title: string) => SaveResult;
  onToggleSubtask: (
    taskId: number,
    subtaskId: number,
    completed: boolean,
  ) => SaveResult;
};

export function TaskDetailsDialog({
  task,
  open,
  onOpenChange,
  finalFocusEl,
  epics,
  sprints,
  onAssignSprint,
  assignees,
  onUpdate,
  onLifecycle,
  onPlacement,
  onAddSubtask,
  onToggleSubtask,
}: TaskDetailsDialogProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open }) => onOpenChange(open)}
      initialFocusEl={() => titleRef.current}
      finalFocusEl={finalFocusEl}
      closeOnInteractOutside={false}
      lazyMount
      unmountOnExit
    >
      <DialogPanel
        title={task ? `Task details · ORB-${task.id}` : "Task details"}
        description="Review the details and keep your team’s next steps clear."
      >
        {task && (
          <Tabs.Root
            defaultValue="details"
            className="flex min-h-0 flex-1 flex-col"
            lazyMount
          >
            <Tabs.List
              aria-label="Task sections"
              className="flex shrink-0 gap-1 overflow-x-auto border-b border-base-300/70 px-3 sm:px-6"
            >
              {[
                { value: "details", label: "Details" },
                {
                  value: "subtasks",
                  label: `Subtasks (${task.subtasks.length})`,
                },
                {
                  value: "discussion",
                  label: `Discussion (${task.comments.length})`,
                },
                { value: "activity", label: "Activity" },
                { value: "manage", label: "Manage" },
              ].map((tab) => (
                <Tabs.Trigger
                  key={tab.value}
                  value={tab.value}
                  type="button"
                  className="shrink-0 border-b-2 border-transparent px-3 py-4 text-[11px] font-medium text-base-content/65 data-[selected]:border-primary data-[selected]:text-primary"
                >
                  {tab.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            <Tabs.Content
              value="details"
              className="flex min-h-0 flex-1 flex-col [&[hidden]]:hidden"
            >
              <TaskForm
                key={task.id}
                epics={epics}
                assignees={assignees}
                initialValues={task}
                titleRef={titleRef}
                submitLabel="Save changes"
                onSave={(input) => {
                  const result = onUpdate(task.id, input);
                  if (result.ok) onOpenChange(false);
                  return result;
                }}
              />
            </Tabs.Content>
            <Tabs.Content
              value="subtasks"
              className="min-h-0 overflow-y-auto p-5 sm:p-7 [&[hidden]]:hidden"
            >
              <SubtaskList
                task={task}
                onAdd={onAddSubtask}
                onToggle={onToggleSubtask}
              />
            </Tabs.Content>
            <Tabs.Content
              value="discussion"
              className="min-h-0 overflow-y-auto p-5 sm:p-7 [&[hidden]]:hidden"
            >
              <TaskDiscussion task={task} />
            </Tabs.Content>
            <Tabs.Content
              value="activity"
              className="min-h-0 overflow-y-auto p-5 sm:p-7 [&[hidden]]:hidden"
            >
              <TaskActivityFeed task={task} />
            </Tabs.Content>
            <Tabs.Content
              value="manage"
              className="min-h-0 space-y-5 overflow-y-auto p-5 sm:p-7 [&[hidden]]:hidden"
            >
              <TaskSprintAction
                task={task}
                sprints={sprints}
                onAssign={(id) => {
                  const result = onAssignSprint(task.id, id);
                  if (result.ok) onOpenChange(false);
                  return result;
                }}
              />
              {!task.archived && (
                <TaskPlacementAction
                  task={task}
                  onMove={(placement) => {
                    const result = onPlacement(task.id, placement);
                    if (result.ok) onOpenChange(false);
                    return result;
                  }}
                />
              )}
              <TaskLifecycleActions
                task={task}
                onAction={(action) => {
                  const result = onLifecycle(task.id, action);
                  if (result.ok) onOpenChange(false);
                  return result;
                }}
              />
            </Tabs.Content>
          </Tabs.Root>
        )}
      </DialogPanel>
    </Dialog.Root>
  );
}
