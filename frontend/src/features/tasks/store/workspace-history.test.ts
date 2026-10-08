import test from "node:test";
import assert from "node:assert/strict";
import {
  workspaceHistorySchema,
  recordWorkspaceDay,
} from "./workspace-history";
test("validates dates, counts and duplicate days", () => {
  assert.equal(
    workspaceHistorySchema.safeParse([
      { date: "2026-02-30", total: 2, completed: 1 },
    ]).success,
    false,
  );
  assert.equal(
    workspaceHistorySchema.safeParse([
      { date: "2026-10-06", total: 1, completed: 2 },
    ]).success,
    false,
  );
  const day = { date: "2026-10-06", total: 2, completed: 1 };
  assert.equal(workspaceHistorySchema.safeParse([day, day]).success, false);
});
test("retains the newest 90 daily records without changing previous input", () => {
  const history = Array.from({ length: 90 }, (_, index) => ({
    date: new Date(Date.UTC(2026, 0, index + 1)).toISOString().slice(0, 10),
    total: 1,
    completed: 0,
  }));
  const updated = recordWorkspaceDay(history, [], "2026-10-06");
  assert.equal(updated.length, 90);
  assert.equal(updated[0].date, "2026-01-02");
  assert.equal(updated.at(-1)?.date, "2026-10-06");
  assert.equal(history[0].date, "2026-01-01");
});
