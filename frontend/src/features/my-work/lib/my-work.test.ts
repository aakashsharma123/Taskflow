import test from "node:test";
import assert from "node:assert/strict";
import { groupMyWork } from "./my-work";
import { sampleTasks } from "@/features/tasks/data/sample-tasks";

test("personal focus excludes archived work and groups real calendar dates across locations", () => {
  const task = sampleTasks[0];
  const tasks = [
    {
      ...task,
      id: 1,
      assignee: "Maya",
      status: "todo" as const,
      dueDate: "2026-10-06",
    },
    {
      ...task,
      id: 2,
      assignee: "Maya",
      status: "todo" as const,
      dueDate: "2026-10-07",
      placement: "backlog" as const,
    },
    {
      ...task,
      id: 3,
      assignee: "Maya",
      status: "done" as const,
      dueDate: "2026-10-06",
    },
    { ...task, id: 4, assignee: "Maya", archived: true, dueDate: "2026-10-06" },
    { ...task, id: 5, assignee: "Jordan", dueDate: "2026-10-06" },
    {
      ...task,
      id: 6,
      assignee: "Maya",
      status: "todo" as const,
      dueDate: "2026-10-08",
    },
    {
      ...task,
      id: 7,
      assignee: "Maya",
      status: "todo" as const,
      dueDate: null,
    },
  ];
  const groups = groupMyWork(tasks, "Maya", "2026-10-07");
  assert.deepEqual(
    Object.values(groups).map((items) => items.map((task) => task.id)),
    [[1], [2], [6], [7], [3]],
  );
});
