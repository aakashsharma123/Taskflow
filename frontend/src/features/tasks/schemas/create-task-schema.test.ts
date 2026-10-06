import assert from "node:assert/strict";
import test from "node:test";
import { createTaskSchema } from "./create-task-schema";

const schema = createTaskSchema({
  epics: ["Workspace"],
  assignees: ["Aakash G"],
});
const validTask = {
  title: "Design the overview",
  status: "todo",
  priority: "medium",
  epic: "",
  assignee: "",
};

test("normalizes a valid task and optional selections", () => {
  const result = schema.parse({
    ...validTask,
    title: "  Design the overview  ",
  });
  assert.equal(result.title, "Design the overview");
  assert.equal(result.epic, null);
  assert.equal(result.assignee, null);
  const assigned = schema.parse({
    ...validTask,
    epic: "Workspace",
    assignee: "Aakash G",
  });
  assert.equal(assigned.epic, "Workspace");
  assert.equal(assigned.assignee, "Aakash G");
});

test("requires a title and enforces the limit after trimming", () => {
  for (const title of ["", "   ", undefined, null, 123]) {
    assert.equal(schema.safeParse({ ...validTask, title }).success, false);
  }
  assert.equal(
    schema.safeParse({ ...validTask, title: `  ${"a".repeat(120)}  ` }).success,
    true,
  );
  assert.equal(
    schema.safeParse({ ...validTask, title: "a".repeat(121) }).success,
    false,
  );
});

test("rejects unknown status and priority values", () => {
  for (const status of ["archived", "", null]) {
    assert.equal(schema.safeParse({ ...validTask, status }).success, false);
  }
  for (const priority of ["urgent", "", null]) {
    assert.equal(schema.safeParse({ ...validTask, priority }).success, false);
  }
});

test("rejects unavailable options while allowing an empty option list", () => {
  assert.equal(
    schema.safeParse({ ...validTask, epic: "Removed epic" }).success,
    false,
  );
  assert.equal(
    schema.safeParse({ ...validTask, assignee: "Unknown person" }).success,
    false,
  );
  assert.equal(
    createTaskSchema({ epics: [], assignees: [] }).safeParse(validTask).success,
    true,
  );
});

test("descriptions default to empty, trim notes, and reject oversized content", () => {
  assert.equal(schema.parse(validTask).description, "");
  assert.equal(
    schema.parse({ ...validTask, description: "  Context\nCriteria  " })
      .description,
    "Context\nCriteria",
  );
  assert.equal(
    schema.safeParse({ ...validTask, description: "a".repeat(5001) }).success,
    false,
  );
});
