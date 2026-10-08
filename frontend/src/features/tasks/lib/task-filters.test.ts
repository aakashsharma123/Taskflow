import test from "node:test";
import assert from "node:assert/strict";
import { defaultTaskFilters, filterTasks } from "./task-filters";
import { sampleTasks } from "../data/sample-tasks";
test("combines filters, searches task IDs, and handles unassigned tasks", () => {
  const filters = {
    ...defaultTaskFilters,
    search: " orb-13 ",
    epic: "Authentication",
    assignee: "unassigned",
    priority: "medium",
    status: "todo",
  };
  assert.deepEqual(
    filterTasks(sampleTasks, filters).map((task) => task.id),
    [13],
  );
  assert.deepEqual(
    filterTasks(sampleTasks, { ...filters, priority: "high" }),
    [],
  );
});
test("sorts deterministically without mutating the source", () => {
  const before = [...sampleTasks];
  assert.equal(filterTasks(sampleTasks, defaultTaskFilters)[0].id, 15);
  assert.equal(
    filterTasks(sampleTasks, { ...defaultTaskFilters, sort: "oldest" })[0].id,
    1,
  );
  const priority = filterTasks(sampleTasks, {
    ...defaultTaskFilters,
    sort: "priority",
  });
  assert.equal(priority[0].priority, "high");
  assert.equal(priority.at(-1)?.priority, "low");
  const titles = filterTasks(sampleTasks, {
    ...defaultTaskFilters,
    sort: "title",
  }).map((task) => task.title);
  assert.deepEqual(
    titles,
    [...titles].sort((a, b) => a.localeCompare(b)),
  );
  assert.deepEqual(sampleTasks, before);
});

test("labels, due filters and due sorting combine without marking completed work overdue", () => {
  const tasks = sampleTasks.map((task) => ({
    ...task,
    labels: ["design"],
    dueDate: task.id === 15 ? null : "2026-10-05",
  }));
  const overdue = filterTasks(
    tasks,
    { ...defaultTaskFilters, label: "design", due: "overdue" },
    "2026-10-06",
  );
  assert.equal(overdue.length, 8);
  assert(overdue.every((task) => task.status !== "done"));
  assert.equal(
    filterTasks(tasks, { ...defaultTaskFilters, due: "today" }, "2026-10-05")
      .length,
    11,
  );
  assert.equal(
    filterTasks(tasks, { ...defaultTaskFilters, due: "none" }).length,
    1,
  );
  assert.equal(
    filterTasks(tasks, { ...defaultTaskFilters, sort: "dueDate" }).at(-1)?.id,
    15,
  );
});
