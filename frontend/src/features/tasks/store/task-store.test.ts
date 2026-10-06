import test from "node:test";
import assert from "node:assert/strict";
import { createTaskStore, TASK_STORAGE_KEY } from "./task-store";
import type { Task } from "../schemas/types/task";

const seed: Task[] = [
  {
    id: 9,
    title: "Seed",
    status: "todo",
    priority: "medium",
    epic: null,
    assignee: null,
    subtasks: [],
    archived: false,
    placement: "board",
  },
];
const input = {
  title: "New task",
  status: "in_review",
  priority: "high",
  epic: null,
  assignee: null,
} as const;
function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}

test("creates unique task IDs and restores saved tasks", () => {
  const storage = memoryStorage();
  const store = createTaskStore(seed, () => storage);
  store.load();
  assert.equal(store.createTask(input).ok, true);
  assert.equal(store.createTask(input).ok, true);
  assert.deepEqual(
    store.getSnapshot().tasks.map((task) => task.id),
    [11, 10, 9],
  );
  const restored = createTaskStore(seed, () => storage);
  restored.load();
  assert.deepEqual(restored.getSnapshot().tasks, store.getSnapshot().tasks);
});

test("failed writes keep previous data and permit retry", () => {
  const memory = memoryStorage();
  let fail = true;
  const store = createTaskStore(seed, () => ({
    ...memory,
    setItem(key, value) {
      if (fail) throw new Error("Quota");
      memory.setItem(key, value);
    },
  }));
  store.load();
  assert.equal(store.createTask(input).ok, false);
  assert.deepEqual(store.getSnapshot().tasks, seed);
  fail = false;
  assert.equal(store.createTask(input).ok, true);
});

test("invalid saved data is preserved and cannot be overwritten", () => {
  const storage = memoryStorage();
  const broken = JSON.stringify({ version: 1, tasks: [...seed, ...seed] });
  storage.setItem(TASK_STORAGE_KEY, broken);
  const store = createTaskStore(seed, () => storage);
  store.load();
  assert(store.getSnapshot().error);
  assert.equal(store.createTask(input).ok, false);
  assert.equal(storage.getItem(TASK_STORAGE_KEY), broken);
});

test("fresh reads include another tab's changes", () => {
  const storage = memoryStorage();
  const first = createTaskStore(seed, () => storage);
  const second = createTaskStore(seed, () => storage);
  first.load();
  second.load();
  first.createTask(input);
  second.createTask(input);
  assert.deepEqual(
    second.getSnapshot().tasks.map((task) => task.id),
    [11, 10, 9],
  );
});

test("updates a task without changing its ID or unrelated tasks", () => {
  const storage = memoryStorage();
  const store = createTaskStore(seed, () => storage);
  store.load();
  store.createTask(input);
  assert.equal(
    store.updateTask(9, { ...input, title: "Updated seed", status: "done" }).ok,
    true,
  );
  assert.equal(
    store.getSnapshot().tasks.find((task) => task.id === 9)?.status,
    "done",
  );
  assert.equal(
    store.getSnapshot().tasks.find((task) => task.id === 10)?.title,
    "New task",
  );
  assert.equal(store.updateTask(999, input).ok, false);
  const restored = createTaskStore(seed, () => storage);
  restored.load();
  assert.equal(
    restored.getSnapshot().tasks.find((task) => task.id === 9)?.title,
    "Updated seed",
  );
});

test("epics survive refresh without tasks and can be assigned", () => {
  const storage = memoryStorage();
  const store = createTaskStore(seed, () => storage);
  store.load();
  assert.equal(store.createEpic("  Onboarding  ").ok, true);
  assert.equal(store.createEpic("onboarding").ok, false);
  const restored = createTaskStore(seed, () => storage);
  restored.load();
  assert.deepEqual(restored.getSnapshot().epics, ["Onboarding"]);
  assert.equal(restored.createTask({ ...input, epic: "Onboarding" }).ok, true);
  assert.equal(
    restored.createTask({ ...input, epic: "Unavailable" }).ok,
    false,
  );
});

test("subtask completion persists without changing the parent status", () => {
  const storage = memoryStorage();
  const store = createTaskStore(seed, () => storage);
  store.load();
  assert.equal(store.addSubtask(9, "  Sketch the screen  ").ok, true);
  assert.equal(store.addSubtask(9, " ").ok, false);
  assert.equal(store.addSubtask(9, "Review the layout").ok, true);
  assert.equal(store.setSubtaskCompleted(9, 1, true).ok, true);
  assert.equal(store.setSubtaskCompleted(9, 2, true).ok, true);
  assert.equal(store.getSnapshot().tasks[0].status, "todo");
  assert.equal(store.setSubtaskCompleted(9, 999, true).ok, false);
  assert.equal(store.addSubtask(999, "Missing parent").ok, false);
  assert.equal(
    store.updateTask(9, { ...input, title: "Updated parent" }).ok,
    true,
  );
  const restored = createTaskStore(seed, () => storage);
  restored.load();
  assert.deepEqual(restored.getSnapshot().tasks[0].subtasks, [
    { id: 1, title: "Sketch the screen", completed: true },
    { id: 2, title: "Review the layout", completed: true },
  ]);
  restored.setSubtaskCompleted(9, 1, false);
  assert.equal(restored.getSnapshot().tasks[0].subtasks[0].completed, false);
});

test("migrates tasks saved before epic catalogs and subtasks existed", () => {
  const storage = memoryStorage();
  const legacy = {
    id: 9,
    title: "Old task",
    status: "todo",
    priority: "medium",
    epic: "Workspace",
    assignee: null,
  };
  storage.setItem(
    TASK_STORAGE_KEY,
    JSON.stringify({ version: 1, tasks: [legacy] }),
  );
  const store = createTaskStore(seed, () => storage);
  store.load();
  assert.equal(store.getSnapshot().error, null);
  assert.deepEqual(store.getSnapshot().epics, ["Workspace"]);
  assert.deepEqual(store.getSnapshot().tasks[0].subtasks, []);
  assert.equal(store.addSubtask(9, "Continue working").ok, true);
});

test("rejects invalid hierarchy and preserves the saved blob", () => {
  const storage = memoryStorage();
  const invalid = JSON.stringify({
    version: 1,
    tasks: [
      {
        ...seed[0],
        subtasks: [{ id: 1, title: "Child", completed: false, subtasks: [] }],
      },
    ],
    epics: [],
  });
  storage.setItem(TASK_STORAGE_KEY, invalid);
  const store = createTaskStore(seed, () => storage);
  store.load();
  assert(store.getSnapshot().error);
  assert.equal(store.createEpic("New epic").ok, false);
  assert.equal(storage.getItem(TASK_STORAGE_KEY), invalid);
});

test("failed subtask writes leave completion and draft data unchanged", () => {
  const storage = memoryStorage();
  let fail = false;
  const store = createTaskStore(seed, () => ({
    ...storage,
    setItem(key, value) {
      if (fail) throw new Error("Quota");
      storage.setItem(key, value);
    },
  }));
  store.load();
  store.addSubtask(9, "First step");
  fail = true;
  assert.equal(store.setSubtaskCompleted(9, 1, true).ok, false);
  assert.equal(store.addSubtask(9, "Retry me").ok, false);
  assert.equal(store.getSnapshot().tasks[0].subtasks[0].completed, false);
  assert.equal(store.getSnapshot().tasks[0].subtasks.length, 1);
});

test("moving a task changes only its status and survives reload", () => {
  const storage = memoryStorage();
  const store = createTaskStore(seed, () => storage);
  store.load();
  assert.equal(store.moveTask(9, "done").ok, true);
  assert.deepEqual(store.getSnapshot().tasks[0], {
    ...seed[0],
    status: "done",
  });
  const restored = createTaskStore(seed, () => storage);
  restored.load();
  assert.equal(restored.getSnapshot().tasks[0].status, "done");
  assert.equal(store.moveTask(999, "done").ok, false);
});

test("archive and deletion preserve children, undo and unique IDs", () => {
  const storage = memoryStorage();
  const store = createTaskStore(seed, () => storage);
  store.load();
  store.addSubtask(9, "Keep me");
  assert.equal(store.setArchived(9, true).ok, true);
  assert.equal(store.getSnapshot().tasks[0].archived, true);
  assert.equal(store.setArchived(9, false).ok, true);
  const before = store.getSnapshot().tasks[0];
  assert.equal(store.deleteTask(9).ok, true);
  assert.equal(store.getSnapshot().tasks.length, 0);
  assert.equal(store.createTask(input).ok, true);
  assert.equal(store.getSnapshot().tasks[0].id, 10);
  assert.equal(store.restoreDeletedTask(9).ok, true);
  assert.deepEqual(store.getSnapshot().tasks[0], before);
  assert.equal(store.restoreDeletedTask(9).ok, false);
  store.load();
  assert.equal(store.getSnapshot().tasks.length, 2);
});

test("failed deletion retains the task", () => {
  const storage = memoryStorage();
  const store = createTaskStore(seed, () => ({
    ...storage,
    setItem() {
      throw new Error("Quota");
    },
  }));
  store.load();
  assert.equal(store.deleteTask(9).ok, false);
  assert.deepEqual(store.getSnapshot().tasks, seed);
  assert.deepEqual(store.getSnapshot().removedTasks, []);
});

test("backlog placement persists, keeps workflow and children, and cannot move archived work", () => {
  const storage = memoryStorage();
  const store = createTaskStore(seed, () => storage);
  store.load();
  assert.equal(store.createTask(input, "backlog").ok, true);
  store.addSubtask(10, "Preserve child");
  assert.equal(store.getSnapshot().tasks[0].placement, "backlog");
  assert.equal(store.setPlacement(10, "board").ok, true);
  store.load();
  assert.equal(store.getSnapshot().tasks[0].placement, "board");
  assert.equal(store.getSnapshot().tasks[0].status, "in_review");
  assert.equal(store.getSnapshot().tasks[0].subtasks.length, 1);
  store.setArchived(10, true);
  assert.equal(store.setPlacement(10, "backlog").ok, false);
  assert.equal(store.setPlacement(999, "board").ok, false);
});

test("records actual daily totals and replaces the same UTC day", () => {
  const storage = memoryStorage();
  let time = "2026-10-05T23:00:00Z";
  const store = createTaskStore(
    seed,
    () => storage,
    () => new Date(time),
  );
  store.load();
  assert.deepEqual(store.getSnapshot().history, []);
  store.moveTask(9, "done");
  store.createTask(input);
  assert.deepEqual(store.getSnapshot().history, [
    { date: "2026-10-05", total: 2, completed: 1 },
  ]);
  time = "2026-10-06T01:00:00Z";
  store.moveTask(10, "done");
  store.setArchived(9, true);
  assert.deepEqual(store.getSnapshot().history, [
    { date: "2026-10-05", total: 2, completed: 1 },
    { date: "2026-10-06", total: 2, completed: 2 },
  ]);
  store.deleteTask(9);
  store.load();
  assert.deepEqual(store.getSnapshot().history[1], {
    date: "2026-10-06",
    total: 1,
    completed: 1,
  });
  store.restoreDeletedTask(9);
  assert.equal(store.getSnapshot().history[1].completed, 2);
});

test("failed writes do not record a misleading completion history", () => {
  const storage = memoryStorage();
  const store = createTaskStore(seed, () => ({
    ...storage,
    setItem() {
      throw new Error("Quota");
    },
  }));
  store.load();
  assert.equal(store.moveTask(9, "done").ok, false);
  assert.deepEqual(store.getSnapshot().history, []);
});

test("legacy tasks migrate placement and archive without inventing history", () => {
  const storage = memoryStorage();
  const legacy = { ...seed[0], archived: undefined, placement: undefined };
  storage.setItem(
    TASK_STORAGE_KEY,
    JSON.stringify({ version: 1, tasks: [legacy] }),
  );
  const store = createTaskStore(seed, () => storage);
  store.load();
  assert.equal(store.getSnapshot().error, null);
  assert.equal(store.getSnapshot().tasks[0].archived, false);
  assert.equal(store.getSnapshot().tasks[0].placement, "board");
  assert.deepEqual(store.getSnapshot().history, []);
});
