"use client";

import { usePathname } from "next/navigation";
import { useTaskStore } from "@/features/tasks/hooks/use-task-store";
import { useFlag } from "@/shared/components/flag-provider";
import { CreateTaskDialog } from "./create-task-dialog";

export function GlobalCreateTask() {
  const pathname = usePathname();
  const { epics, settings, ready, error, createTask } = useTaskStore();
  const showFlag = useFlag();
  const placement = pathname === "/backlog" ? "backlog" : "board";
  return (
    <CreateTaskDialog
      epics={epics}
      assignees={settings.members}
      disabled={!ready || Boolean(error)}
      onCreate={(input) => {
        const result = createTask(input, placement);
        if (result.ok)
          showFlag({
            message: `Task created and saved in ${placement === "backlog" ? "Backlog" : "Board"}.`,
          });
        return result;
      }}
    />
  );
}
