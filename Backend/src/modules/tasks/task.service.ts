import { findAllTasks } from "./task.repository";
import type { TaskType } from "./task.types";

export const listTasks = (): TaskType[] => findAllTasks();
