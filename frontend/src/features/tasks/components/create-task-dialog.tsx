"use client";

import { useRef, useState } from "react";
import { Dialog } from "@ark-ui/react/dialog";
import { DialogPanel } from "@/shared/ui/dialog-panel";
import { TaskForm } from "@/features/tasks/components/task-form";
import type { CreateTaskInput } from "@/features/tasks/schemas/create-task-schema";
import type { SaveResult } from "@/features/tasks/store/task-store";

type CreateTaskDialogProps = {
  defaultEpic?: string;
  epics: string[];
  assignees: string[];
  onCreate: (input: CreateTaskInput) => SaveResult;
  disabled?: boolean;
};

export function CreateTaskDialog({
  defaultEpic,
  epics,
  assignees,
  onCreate,
  disabled,
}: CreateTaskDialogProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open }) => setOpen(open)}
      initialFocusEl={() => titleRef.current}
      closeOnInteractOutside={false}
      lazyMount
      unmountOnExit
    >
      <Dialog.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="btn btn-primary h-10 rounded-xl px-4 text-xs"
        >
          <span aria-hidden="true" className="text-lg font-normal">
            +
          </span>
          New task
        </button>
      </Dialog.Trigger>
      <DialogPanel
        title="New task"
        description="Turn your next idea into a clear, actionable task."
      >
        <TaskForm
          defaultEpic={defaultEpic}
          epics={epics}
          assignees={assignees}
          titleRef={titleRef}
          submitLabel="Create task"
          onSave={(input) => {
            const result = onCreate(input);
            if (result.ok) setOpen(false);
            return result;
          }}
        />
      </DialogPanel>
    </Dialog.Root>
  );
}
