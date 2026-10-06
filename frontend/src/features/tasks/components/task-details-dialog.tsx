"use client";

import { useRef } from "react";
import { Dialog } from "@ark-ui/react/dialog";
import { DialogPanel } from "@/shared/ui/dialog-panel";
import { SubtaskList } from "@/features/tasks/components/subtask-list";
import { TaskPlacementAction } from "./task-placement-action";
import { TaskLifecycleActions } from "./task-lifecycle-actions";
import { TaskForm } from "@/features/tasks/components/task-form";
import type { Task, TaskPlacement } from "@/features/tasks/schemas/types/task";
import type { CreateTaskInput } from "@/features/tasks/schemas/create-task-schema";
import type { SaveResult } from "@/features/tasks/store/task-store";

type TaskDetailsDialogProps = {
  task: Task | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  finalFocusEl: () => HTMLElement | null;
  epics: string[];
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
          >
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
            <SubtaskList
              task={task}
              onAdd={onAddSubtask}
              onToggle={onToggleSubtask}
            />
          </TaskForm>
        )}
      </DialogPanel>
    </Dialog.Root>
  );
}
