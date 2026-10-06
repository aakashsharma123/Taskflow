import { z } from "zod";
import type { Task } from "@/features/tasks/types/task";
const countSchema = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
export const dailySummarySchema = z
  .object({ date: z.iso.date(), total: countSchema, completed: countSchema })
  .refine((day) => day.completed <= day.total);
export type DailySummary = z.output<typeof dailySummarySchema>;
export const workspaceHistorySchema = z
  .array(dailySummarySchema)
  .max(90)
  .refine((days) => new Set(days.map((day) => day.date)).size === days.length);
export function recordWorkspaceDay(
  history: DailySummary[],
  tasks: Task[],
  date: string,
): DailySummary[] {
  const day = {
    date,
    total: tasks.length,
    completed: tasks.filter((task) => task.status === "done").length,
  };
  return [...history.filter((day) => day.date !== date), day]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-90);
}
