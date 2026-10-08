import { z } from "zod";

export const taskLabelsSchema = z
  .array(
    z.string().trim().min(1).max(24, {
      error: "Keep each label to 24 characters or fewer.",
    }),
  )
  .max(5, { error: "Use up to five labels." })
  .refine(
    (labels) =>
      new Set(labels.map((label) => label.toLowerCase())).size ===
      labels.length,
    { error: "Each label must be unique." },
  )
  .default([]);
export const taskDueDateSchema = z.iso
  .date({ error: "Choose a valid due date." })
  .nullable()
  .default(null);
