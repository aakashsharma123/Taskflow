export type TaskStatus = "todo" | "in_progress" | "in_review" | "done";

export type Subtask = {
  id: number;
  title: string;
  completed: boolean;
};

export type TaskPlacement = "board" | "backlog";

export type TaskActivity = { id: number; at: string; message: string };

export type TaskComment = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  updatedAt: string | null;
};

export type Task = {
  comments: TaskComment[];
  id: number;
  title: string;
  description: string;
  activity: TaskActivity[];
  labels: string[];
  dueDate: string | null;
  status: TaskStatus;
  epic: string | null;
  priority: "high" | "medium" | "low";
  assignee: string | null;
  subtasks: Subtask[];
  archived: boolean;
  placement: TaskPlacement;
  sprintId: number | null;
};
