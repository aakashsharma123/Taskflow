import { Router } from "express";
import { getTasks } from "./task.controller";

export const taskRouter = Router();

taskRouter.get("/", getTasks);
