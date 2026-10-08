export type TaskStatus = "todo" | "in_progress" | "in_review" | "done";

export type Subtask = {
  id: number;
  title: string;
  completed: boolean;
};

export type TaskPlacement = "board" | "backlog";

export type Task = {
  id: number;
  title: string;
  description: string;
  labels: string[];
  dueDate: string | null;
  status: TaskStatus;
  epic: string | null;
  priority: "high" | "medium" | "low";
  assignee: string | null;
  subtasks: Subtask[];
  archived: boolean;
  placement: TaskPlacement;
};
