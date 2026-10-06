import { z } from "zod";

export const subtaskTitleSchema = z
  .string({ error: "Enter a subtask title." })
  .trim()
  .min(1, { error: "Enter a subtask title." })
  .max(120, { error: "Keep the subtask title to 120 characters or fewer." });
