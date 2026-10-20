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
      className={`flex min-h-[480px] flex-col rounded-md p-1.5 ${isDropTarget ? "bg-selected ring-2 ring-focus ring-inset" : "bg-sunken"}`}
    >
      {children}
    </section>
  );
}
