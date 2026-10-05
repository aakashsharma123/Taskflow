import express from "express";
import { taskRouter } from "./modules/tasks/task.routes";

export const app = express();

app.use(express.json());
app.use("/api/tasks", taskRouter);
