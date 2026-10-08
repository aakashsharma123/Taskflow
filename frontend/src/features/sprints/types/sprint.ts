import type { z } from "zod";
import type { sprintSchema } from "../schemas/sprint-schema";
export type Sprint = z.output<typeof sprintSchema>;
