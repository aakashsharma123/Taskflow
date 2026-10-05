import type { TaskType } from "./task.types";

const tasks: TaskType[] = [
  {
    id: 1,
    title: "Learn Express",
    completed: false,
  },
  {
    id: 2,
    title: "Learn TypeScript",
    completed: true,
  },
];

export const findAllTasks = (): TaskType[] => tasks.map((task) => ({ ...task }));
