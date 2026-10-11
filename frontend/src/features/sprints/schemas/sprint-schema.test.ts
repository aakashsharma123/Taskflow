import test from "node:test";
import assert from "node:assert/strict";
import { createSprintSchema, sprintsSchema } from "./sprint-schema";
const input = {
  name: " Sprint 1 ",
  goal: " A clear release ",
  startDate: "2026-10-06",
  endDate: "2026-10-20",
};
test("sprint planning requires a real date range and bounded goal", () => {
  assert.equal(createSprintSchema.parse(input).name, "Sprint 1");
  for (const invalid of [
    { ...input, name: "" },
    { ...input, endDate: "2026-10-01" },
    { ...input, startDate: "2026-02-30" },
    { ...input, goal: "x".repeat(501) },
  ])
    assert.equal(createSprintSchema.safeParse(invalid).success, false);
});
test("saved sprints reject duplicate IDs, multiple active sprints and inconsistent summaries", () => {
  const sprint = { ...input, id: 1, status: "active", summary: null };
  assert.equal(
    sprintsSchema.safeParse([sprint, { ...sprint, id: 2 }]).success,
    false,
  );
  assert.equal(
    sprintsSchema.safeParse([
      {
        ...sprint,
        status: "completed",
        summary: { total: 3, completed: 1, carried: 1 },
      },
    ]).success,
    false,
  );
});
