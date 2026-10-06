import { z } from "zod";
import type { Task, TaskActivity } from "../types/task";

export const taskActivitySchema = z
  .array(
    z.object({
      id: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
      at: z.iso.datetime(),
      message: z.string().min(1).max(200),
    }),
  )
  .max(100)
  .refine(
    (entries) =>
      new Set(entries.map((entry) => entry.id)).size === entries.length,
  )
  .default([]);
const statuses = {
  todo: "To do",
  in_progress: "In progress",
  in_review: "In review",
  done: "Done",
};

export function recordTaskActivity(
  before: Task | undefined,
  after: Task,
  wasRemoved: boolean,
  removed: boolean,
  at: string,
): TaskActivity[] {
  const messages: string[] = [];
  if (!before) messages.push("Task created");
  else if (removed && !wasRemoved) messages.push("Task deleted");
  else if (!removed && wasRemoved) messages.push("Restored after deletion");
  else {
    if (before.title !== after.title) messages.push("Title updated");
    if (before.description !== after.description)
      messages.push("Description updated");
    if (before.status !== after.status)
      messages.push(
        `Status changed from ${statuses[before.status]} to ${statuses[after.status]}`,
      );
    if (before.assignee !== after.assignee)
      messages.push(
        after.assignee ? `Assigned to ${after.assignee}` : "Assignee cleared",
      );
    if (before.priority !== after.priority)
      messages.push(`Priority changed to ${after.priority}`);
    if (before.epic !== after.epic)
      messages.push(
        after.epic ? `Epic changed to ${after.epic}` : "Epic cleared",
      );
    if (before.dueDate !== after.dueDate)
      messages.push(
        after.dueDate ? `Due date set to ${after.dueDate}` : "Due date cleared",
      );
    if (JSON.stringify(before.labels) !== JSON.stringify(after.labels))
      messages.push("Labels updated");
    if (before.placement !== after.placement)
      messages.push(
        `Moved to ${after.placement === "board" ? "Board" : "Backlog"}`,
      );
    if (before.archived !== after.archived)
      messages.push(after.archived ? "Task archived" : "Restored from archive");
    for (const subtask of after.subtasks) {
      const previous = before.subtasks.find((item) => item.id === subtask.id);
      if (!previous) messages.push(`Subtask added: ${subtask.title}`);
      else if (previous.completed !== subtask.completed)
        messages.push(
          `${subtask.completed ? "Completed" : "Reopened"} subtask: ${subtask.title}`,
        );
    }
  }
  const previous = before?.activity ?? [];
  let id = previous.reduce((max, entry) => Math.max(max, entry.id), 0);
  return [
    ...previous,
    ...messages.map((message) => ({ id: ++id, at, message })),
  ].slice(-100);
}
