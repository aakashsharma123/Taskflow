import type { z } from "zod";
import type { workspaceSettingsSchema } from "../schemas/workspace-settings-schema";
export type WorkspaceSettings = z.output<typeof workspaceSettingsSchema>;
