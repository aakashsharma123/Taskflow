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
