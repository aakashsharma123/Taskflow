
import type { Request, Response } from "express";
import { listTasks } from "./task.service";

export const getTasks = (_req: Request, res: Response): void => {
  res.status(200).json(listTasks());
};
