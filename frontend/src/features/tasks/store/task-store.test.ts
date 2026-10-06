import test from "node:test";
import assert from "node:assert/strict";
import { createTaskStore, TASK_STORAGE_KEY } from "./task-store";
import type { Task } from "../types/task";

const seed: Task[] = [
  {
    id: 9,
    title: "Seed",
    status: "todo",
    priority: "medium",
    epic: null,
    assignee: null,
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
