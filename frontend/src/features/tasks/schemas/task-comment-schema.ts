import { z } from "zod";
export const commentBodySchema = z
  .string()
  .trim()
  .min(1, { error: "Write a comment first." })
  .max(2000, { error: "Keep comments to 2,000 characters or fewer." });
export const taskCommentsSchema = z
  .array(
    z.object({
      id: z.uuid(),
      author: z.string().trim().min(1).max(60),
      body: commentBodySchema,
      createdAt: z.iso.datetime(),
      updatedAt: z.iso.datetime().nullable(),
    }),
  )
  .max(200)
  .refine(
    (items) => new Set(items.map((item) => item.id)).size === items.length,
  )
  .default([]);
