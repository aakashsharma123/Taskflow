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
      className={`min-h-[520px] rounded-xl bg-base-200 p-2.5 ${isDropTarget ? "ring-2 ring-secondary ring-inset" : ""}`}
    >
      {children}
    </section>
  );
}
