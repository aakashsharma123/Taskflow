"use client";

import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/react";
import type { TaskStatus } from "@/features/tasks/types/task";

export function BoardColumn({
  status,
  children,
}: {
  status: TaskStatus;
  children: ReactNode;
}) {
  const { ref, isDropTarget } = useDroppable({ id: status, accept: "task" });
  return (
    <section
      ref={ref}
      data-column={status}
      aria-labelledby={`column-${status}`}
      className={`board-column flex min-h-[420px] flex-col p-2.5 sm:min-h-[540px] ${isDropTarget ? "bg-selected ring-2 ring-focus ring-inset" : "bg-panel-soft"}`}
    >
      {children}
    </section>
  );
}
