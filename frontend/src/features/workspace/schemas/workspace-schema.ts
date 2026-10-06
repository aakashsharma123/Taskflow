import { z } from "zod";
import { taskCommentsSchema } from "@/features/tasks/schemas/task-comment-schema";
import type { Task } from "@/features/tasks/types/task";
import {
  taskTitleSchema,
  taskDescriptionSchema,
} from "@/features/tasks/schemas/create-task-schema";
import {
  taskLabelsSchema,
  taskDueDateSchema,
} from "@/features/tasks/schemas/task-metadata-schema";
import { subtaskTitleSchema } from "@/features/tasks/schemas/subtask-schema";
import { taskActivitySchema } from "@/features/tasks/store/task-activity";
import { workspaceHistorySchema } from "@/features/tasks/store/workspace-history";
import { sprintsSchema } from "@/features/sprints/schemas/sprint-schema";
import { workspaceSettingsSchema } from "@/features/settings/schemas/workspace-settings-schema";

const idSchema = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
const subtaskSchema = z
  .object({ id: idSchema, title: subtaskTitleSchema, completed: z.boolean() })
  .strict();
const savedTaskSchema: z.ZodType<Task> = z.object({
  id: idSchema,
  archived: z.boolean().default(false),
  sprintId: idSchema.nullable().default(null),
  placement: z.enum(["board", "backlog"]).default("board"),
  activity: taskActivitySchema,
  comments: taskCommentsSchema,
  title: taskTitleSchema,
  description: taskDescriptionSchema,
  labels: taskLabelsSchema,
  dueDate: taskDueDateSchema,
  status: z.enum(["todo", "in_progress", "in_review", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  epic: z.string().min(1).max(60).nullable(),
  assignee: z.string().min(1).max(60).nullable(),
  subtasks: z
    .array(subtaskSchema)
    .default([])
    .refine(
      (items) => new Set(items.map((item) => item.id)).size === items.length,
    ),
});
export const workspaceSchema = z.object({
  version: z.literal(1),
  sprints: sprintsSchema,
  settings: workspaceSettingsSchema.optional(),
  history: workspaceHistorySchema.default([]),
  removedTasks: z.array(savedTaskSchema).default([]),
  tasks: z
    .array(savedTaskSchema)
    .refine(
      (tasks) => new Set(tasks.map((task) => task.id)).size === tasks.length,
    ),
  epics: z
    .array(z.string().trim().min(1).max(60))
    .refine(
      (names) =>
        new Set(names.map((name) => name.toLowerCase())).size === names.length,
    )
    .optional(),
});
