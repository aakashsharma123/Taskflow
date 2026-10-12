"use client";

import { TaskSprintAction } from "@/features/sprints/components/task-sprint-action";
import type { Sprint } from "@/features/sprints/types/sprint";
import { TaskActivityFeed } from "./task-activity-feed";
import { useRef, useState } from "react";
import { Dialog } from "@ark-ui/react/dialog";
import { DialogPanel } from "@/shared/ui/dialog-panel";
import { SubtaskList } from "@/features/tasks/components/subtask-list";
import { TaskPlacementAction } from "./task-placement-action";
import {
  TaskActionsMenu,
  TaskLifecycleConfirm,
  type LifecycleAction,
} from "./task-lifecycle-actions";
import { EpicIcon, TaskTypeIcon } from "./task-icons";
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
  onLifecycle: (id: number, action: LifecycleAction) => SaveResult;
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
  const confirmRef = useRef<HTMLButtonElement>(null);
  const [pending, setPending] = useState<LifecycleAction | null>(null);
  const setOpen = (next: boolean) => {
    if (!next) setPending(null);
    onOpenChange(next);
  };
  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open }) => setOpen(open)}
      initialFocusEl={() => titleRef.current}
      finalFocusEl={finalFocusEl}
      closeOnInteractOutside={false}
      lazyMount
      unmountOnExit
    >
      <DialogPanel
        variant="issue"
        title={
          task ? (
            <>
              <span className="sr-only">Task details · </span>
              {task.epic && (
                <>
                  <span className="inline-flex items-center gap-1.5">
                    <EpicIcon />
                    {task.epic}
                  </span>
                  <span aria-hidden="true">/</span>
                </>
              )}
              <span className="inline-flex items-center gap-1.5">
                <TaskTypeIcon />
                ORB-{task.id}
              </span>
            </>
          ) : (
            "Task details"
          )
        }
        actions={
          task && (
            <TaskActionsMenu
              task={task}
              onSelect={(action) => {
                setPending(action);
                requestAnimationFrame(() => confirmRef.current?.focus());
              }}
            />
          )
        }
      >
        {task && (
          <TaskForm
            key={task.id}
            layout="details"
            epics={epics}
            assignees={assignees}
            initialValues={task}
            titleRef={titleRef}
            submitLabel="Save changes"
            onSave={(input) => {
              const result = onUpdate(task.id, input);
              if (result.ok) setOpen(false);
              return result;
            }}
            banner={
              pending && (
                <TaskLifecycleConfirm
                  key={pending}
                  action={pending}
                  inSprint={task.sprintId !== null}
                  confirmRef={confirmRef}
                  onCancel={() => {
                    setPending(null);
                    titleRef.current?.focus();
                  }}
                  onConfirm={() => {
                    const result = onLifecycle(task.id, pending);
                    if (result.ok) setOpen(false);
                    return result;
                  }}
                />
              )
            }
            main={
              <>
                <SubtaskList
                  task={task}
                  onAdd={onAddSubtask}
                  onToggle={onToggleSubtask}
                />
                <TaskActivityFeed task={task} />
              </>
            }
            side={
              <>
                <TaskSprintAction
                  task={task}
                  sprints={sprints}
                  onAssign={(id) => {
                    const result = onAssignSprint(task.id, id);
                    if (result.ok) setOpen(false);
                    return result;
                  }}
                />
                {!task.archived && (
                  <TaskPlacementAction
                    task={task}
                    onMove={(placement) => {
                      const result = onPlacement(task.id, placement);
                      if (result.ok) setOpen(false);
                      return result;
                    }}
                  />
                )}
              </>
            }
          />
        )}
      </DialogPanel>
    </Dialog.Root>
  );
}
