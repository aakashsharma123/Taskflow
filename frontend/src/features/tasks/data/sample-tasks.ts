import type { Task } from "@/features/tasks/types/task";

// Frontend fixtures only; this board model is not the current backend contract.
const taskFixtures = [
  {
    id: 12,
    title: "Design a welcoming sign-in experience",
    status: "todo",
    epic: "Authentication",
    priority: "high",
    assignee: "Aakash G",
  },
  {
    id: 13,
    title: "Add password reset and recovery screens",
    status: "todo",
    epic: "Authentication",
    priority: "medium",
    assignee: null,
  },
  {
    id: 14,
    title: "Break down tasks into smaller subtasks",
    status: "todo",
    epic: "Task management",
    priority: "medium",
    assignee: "Maya Chen",
  },
  {
    id: 15,
    title: "Group related work into epics",
    status: "todo",
    epic: "Task management",
    priority: "low",
    assignee: "Jordan Lee",
  },
  {
    id: 8,
    title: "Build a clearer project board",
    status: "in_progress",
    epic: "Workspace",
    priority: "high",
    assignee: "Aakash G",
  },
  {
    id: 9,
    title: "Create reusable task cards",
    status: "in_progress",
    epic: "Task management",
    priority: "medium",
    assignee: "Maya Chen",
  },
  {
    id: 10,
    title: "Make the workspace work on smaller screens",
    status: "in_progress",
    epic: "Workspace",
    priority: "high",
    assignee: "Jordan Lee",
  },
  {
    id: 6,
    title: "Review navigation and keyboard accessibility",
    status: "in_review",
    epic: "Workspace",
    priority: "high",
    assignee: "Maya Chen",
  },
  {
    id: 7,
    title: "Check typography, spacing, and colors",
    status: "in_review",
    epic: "Workspace",
    priority: "low",
    assignee: "Aakash G",
  },
  {
    id: 1,
    title: "Set up the frontend project",
    status: "done",
    epic: "Workspace",
    priority: "high",
    assignee: "Aakash G",
  },
  {
    id: 2,
    title: "Add Poppins and the application theme",
    status: "done",
    epic: "Workspace",
    priority: "medium",
    assignee: "Jordan Lee",
  },
  {
    id: 3,
    title: "Create the workspace layout",
    status: "done",
    epic: "Workspace",
    priority: "medium",
    assignee: "Maya Chen",
  },
] satisfies Omit<Task, "subtasks">[];

export const sampleTasks: Task[] = taskFixtures.map((task) => ({
  ...task,
  subtasks:
    task.id === 14
      ? [
          { id: 1, title: "Define the subtask fields", completed: false },
          { id: 2, title: "Add completion tracking", completed: false },
        ]
      : [],
}));
