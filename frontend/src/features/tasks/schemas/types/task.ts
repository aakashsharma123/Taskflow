export type TaskStatus = "todo" | "in_progress" | "in_review" | "done";

export type Subtask = {
  id: number;
  title: string;
  completed: boolean;
};

export type Task = {
  id: number;
  title: string;
  status: TaskStatus;
  epic: string | null;
  priority: "high" | "medium" | "low";
  assignee: string | null;
  subtasks: Subtask[];
  archived: boolean;
};
