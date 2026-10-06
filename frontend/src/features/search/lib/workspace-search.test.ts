import test from "node:test";
import assert from "node:assert/strict";
import { searchWorkspace } from "./workspace-search";
import { sampleTasks } from "@/features/tasks/data/sample-tasks";
test("search matches all terms across task metadata and includes archived tasks", () => {
  const task = {
    ...sampleTasks[0],
    id: 42,
    title: "Polish board",
    description: "Keyboard access",
    labels: ["UX"],
    archived: true,
  };
  assert.equal(
    searchWorkspace([task], [], [], "orb-42 keyboard ux").tasks[0]?.id,
    42,
  );
  assert.equal(
    searchWorkspace([task], [], [], "board missing").tasks.length,
    0,
  );
  assert.equal(searchWorkspace([task], [], [], "  ").tasks.length, 0);
  assert.deepEqual(
    searchWorkspace([], ["Release plan", "Other"], [], "release plan").epics,
    ["Release plan"],
  );
});
