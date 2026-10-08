import { z } from "zod";

type TaskOptions = {
  epics: readonly string[];
  assignees: readonly string[];
};

export function createTaskSchema({ epics, assignees }: TaskOptions) {
  return z.object({
    title: z
      .string({ error: "Enter a task title." })
      .trim()
      .min(1, { error: "Enter a task title." })
      .max(120, { error: "Keep the title to 120 characters or fewer." }),
    status: z.enum(["todo", "in_progress", "in_review", "done"], {
      error: "Choose a valid status.",
    }),
    priority: z.enum(["low", "medium", "high"], {
      error: "Choose a valid priority.",
    }),
    epic: z
      .string({ error: "Choose an available epic or No epic." })
      .refine((value) => value === "" || epics.includes(value), {
        error: "Choose an available epic or No epic.",
      })
      .transform((value) => value || null),
    assignee: z
      .string({ error: "Choose an available assignee or Unassigned." })
      .refine((value) => value === "" || assignees.includes(value), {
        error: "Choose an available assignee or Unassigned.",
      })
      .transform((value) => value || null),
  });
}

export type CreateTaskInput = z.output<ReturnType<typeof createTaskSchema>>;
export type CreateTaskFieldErrors = Partial<
  Record<keyof CreateTaskInput, string[]>
>;
