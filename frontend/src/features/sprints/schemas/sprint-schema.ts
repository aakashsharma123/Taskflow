import { z } from "zod";

export const createSprintSchema = z
  .object({
    name: z.string().trim().min(1, { error: "Enter a sprint name." }).max(60),
    goal: z
      .string()
      .trim()
      .max(500, { error: "Keep the goal to 500 characters or fewer." }),
    startDate: z.iso.date({ error: "Choose a start date." }),
    endDate: z.iso.date({ error: "Choose an end date." }),
  })
  .refine((sprint) => sprint.endDate >= sprint.startDate, {
    path: ["endDate"],
    error: "End date must be on or after the start date.",
  });
export type CreateSprintInput = z.output<typeof createSprintSchema>;
export const sprintSchema = z
  .object({
    id: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
    name: z.string().trim().min(1).max(60),
    goal: z.string().max(500),
    startDate: z.iso.date(),
    endDate: z.iso.date(),
    status: z.enum(["planned", "active", "completed"]),
    summary: z
      .object({
        total: z.number().int().nonnegative(),
        completed: z.number().int().nonnegative(),
        carried: z.number().int().nonnegative(),
      })
      .refine(
        (summary) => summary.completed + summary.carried === summary.total,
      )
      .nullable()
      .default(null),
  })
  .refine(
    (sprint) =>
      sprint.endDate >= sprint.startDate &&
      (sprint.status === "completed"
        ? sprint.summary !== null
        : sprint.summary === null),
  );
export const sprintsSchema = z
  .array(sprintSchema)
  .refine(
    (sprints) =>
      new Set(sprints.map((sprint) => sprint.id)).size === sprints.length &&
      sprints.filter((sprint) => sprint.status === "active").length <= 1,
  )
  .default([]);
