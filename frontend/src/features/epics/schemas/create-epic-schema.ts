import { z } from "zod";

export function createEpicSchema(existingNames: readonly string[]) {
  return z
    .string({ error: "Enter an epic name." })
    .trim()
    .min(1, { error: "Enter an epic name." })
    .max(60, { error: "Keep the epic name to 60 characters or fewer." })
    .refine(
      (name) =>
        !existingNames.some(
          (existing) => existing.toLowerCase() === name.toLowerCase(),
        ),
      {
        error: "An epic with this name already exists.",
      },
    );
}
