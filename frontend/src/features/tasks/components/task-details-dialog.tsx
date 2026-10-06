"use client";

import { useRef } from "react";
import { Dialog } from "@ark-ui/react/dialog";
import { DialogPanel } from "@/shared/ui/dialog-panel";
import { TaskForm } from "@/features/tasks/components/task-form";
import type { Task } from "@/features/tasks/types/task";
import type { CreateTaskInput } from "@/features/tasks/schemas/create-task-schema";
import type { SaveResult } from "@/features/tasks/store/task-store";

type TaskDetailsDialogProps = {
  task: Task | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  finalFocusEl: () => HTMLElement | null;
  epics: string[];
  assignees: string[];
  onUpdate: (id: number, input: CreateTaskInput) => SaveResult;
};

export function TaskDetailsDialog({
  task,
  open,
  onOpenChange,
  finalFocusEl,
  epics,
  assignees,
  onUpdate,
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
          />
        )}
      </DialogPanel>
    </Dialog.Root>
  );
}
