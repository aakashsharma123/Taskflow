import { z } from "zod";
export const memberNameSchema = z
  .string()
  .trim()
  .min(1, { error: "Enter a member name." })
  .max(60, { error: "Keep member names to 60 characters or fewer." });
export const projectSettingsSchema = z.object({
  projectName: z
    .string()
    .trim()
    .min(1, { error: "Enter a project name." })
    .max(60, { error: "Keep the project name to 60 characters or fewer." }),
  appearance: z.enum(["apricot", "sage", "lavender"]),
});
export const workspaceSettingsSchema = projectSettingsSchema
  .extend({
    currentMember: memberNameSchema.nullable().default(null),
    members: z
      .array(memberNameSchema)
      .max(50)
      .refine(
        (members) =>
          new Set(members.map((name) => name.toLowerCase())).size ===
          members.length,
      ),
  })
  .refine(
    (settings) =>
      settings.currentMember === null ||
      settings.members.includes(settings.currentMember),
    { error: "Choose an existing workspace member.", path: ["currentMember"] },
  );
export type ProjectSettingsInput = z.output<typeof projectSettingsSchema>;
