"use client";

import { useRef, useState } from "react";
import { Dialog } from "@ark-ui/react/dialog";
import { m } from "framer-motion";
import { DialogPanel } from "@/shared/ui/dialog-panel";
import { TaskForm } from "@/features/tasks/components/task-form";
import type { CreateTaskInput } from "@/features/tasks/schemas/create-task-schema";
import type { SaveResult } from "@/features/tasks/store/task-store";

type CreateTaskDialogProps = {
  epics: string[];
  assignees: string[];
  onCreate: (input: CreateTaskInput) => SaveResult;
  disabled?: boolean;
};

export function CreateTaskDialog({
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
        <m.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          disabled={disabled}
          className="ui-button ui-button-primary"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            className="size-4"
          >
            <path d="M8 3v10M3 8h10" />
          </svg>
          Create<span className="hidden sm:inline"> task</span>
        </m.button>
      </Dialog.Trigger>
      <DialogPanel title="Create task">
        <TaskForm
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
