import test from "node:test";
import assert from "node:assert/strict";
import { taskSprintStatus } from "./task-sprint-state";
import type { Sprint } from "../types/sprint";

const sprint = (id: number, status: Sprint["status"]): Sprint => ({
  id,
  name: `Sprint ${id}`,
  goal: "",
  startDate: "2026-10-06",
  endDate: "2026-10-20",
  status,
  summary:
    status === "completed" ? { total: 1, completed: 1, carried: 0 } : null,
});
const sprints = [
  sprint(1, "planned"),
  sprint(2, "active"),
  sprint(3, "completed"),
];

test("returns the state of the task's sprint", () => {
  assert.equal(taskSprintStatus({ sprintId: 1 }, sprints), "planned");
  assert.equal(taskSprintStatus({ sprintId: 2 }, sprints), "active");
  assert.equal(taskSprintStatus({ sprintId: 3 }, sprints), "completed");
});

test("returns null when the task has no sprint", () => {
  assert.equal(taskSprintStatus({ sprintId: null }, sprints), null);
});
