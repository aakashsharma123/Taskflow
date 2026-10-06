export type TaskStatus = "todo" | "in_progress" | "in_review" | "done";

export type Task = {
  id: number;
  title: string;
  status: TaskStatus;
  epic: string | null;
  priority: "high" | "medium" | "low";
  assignee: string | null;
};
