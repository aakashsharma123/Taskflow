import test from "node:test";
import assert from "node:assert/strict";
import { summarizeProject, completionTrend } from "./project-summary";
import { sampleTasks } from "@/features/tasks/data/sample-tasks";
test("dashboard totals separate board, backlog and archive while retaining completed work", () => {
  const tasks = sampleTasks.map((task) =>
    task.id === 12
      ? { ...task, placement: "backlog" as const }
      : task.id === 1
        ? { ...task, archived: true }
        : task,
  );
  const summary = summarizeProject(tasks, ["Workspace", "Empty goal"]);
  assert.equal(summary.total, 12);
  assert.equal(summary.board, 10);
  assert.equal(summary.backlog, 1);
  assert.equal(summary.archived, 1);
  assert.equal(summary.completed, 3);
  assert.equal(summary.completionRate, 25);
  assert.equal(
    summary.statuses.reduce((sum, status) => sum + status.count, 0),
    10,
  );
  assert.equal(summary.epics[0].completed, 3);
  assert.equal(summary.epics[1].percent, 0);
  const empty = summarizeProject([], []);
  assert.equal(empty.completionRate, 0);
  assert.equal(empty.total, 0);
});
test("trend keeps unknown days empty and carries real totals across gaps", () => {
  const history = [
    { date: "2026-10-03", total: 12, completed: 1 },
    { date: "2026-10-05", total: 12, completed: 2 },
  ];
  const trend = completionTrend(history, sampleTasks, "2026-10-06");
  assert.deepEqual(
    trend.map((day) => day.completed),
    [null, null, null, 1, 1, 2, 3],
  );
  assert.equal(trend[0].date, "2026-09-30");
  assert.equal(trend[6].date, "2026-10-06");
  assert.deepEqual(
    completionTrend([], sampleTasks, "2026-10-06").map((day) => day.completed),
    [null, null, null, null, null, null, 3],
  );
});
