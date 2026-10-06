import test from "node:test";
import assert from "node:assert/strict";
import { createTaskStore, TASK_STORAGE_KEY } from "./task-store";
import type { Task } from "../types/task";
import type { CreateTaskInput } from "../schemas/create-task-schema";

const seed: Task[] = [
  {
    id: 9,
    title: "Seed",
    activity: [],
    description: "",
    labels: [],
    dueDate: null,
    status: "todo",
    priority: "medium",
    epic: null,
    assignee: null,
    subtasks: [],
    archived: false,
    placement: "board",
    sprintId: null,
  },
];
const input: CreateTaskInput = {
  title: "New task",
  description: "",
  labels: [],
  dueDate: null,
  status: "in_review",
  priority: "high",
  epic: null,
  assignee: null,
};
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
  assert.deepEqual(
    { ...store.getSnapshot().tasks[0], activity: [] },
    {
      ...seed[0],
      status: "done",
    },
  );
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
  assert.deepEqual(
    { ...store.getSnapshot().tasks[0], activity: before.activity },
    before,
  );
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

test("descriptions migrate, persist, and survive archive and undo", () => {
  const storage = memoryStorage();
  storage.setItem(
    TASK_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      tasks: [{ ...seed[0], description: undefined }],
    }),
  );
  const store = createTaskStore(seed, () => storage);
  store.load();
  assert.equal(store.getSnapshot().tasks[0].description, "");
  assert.equal(
    store.updateTask(9, {
      ...input,
      description: "  Acceptance criteria\nKeep line breaks  ",
    }).ok,
    true,
  );
  store.setArchived(9, true);
  store.deleteTask(9);
  store.restoreDeletedTask(9);
  store.load();
  assert.equal(
    store.getSnapshot().tasks[0].description,
    "Acceptance criteria\nKeep line breaks",
  );
  assert.equal(
    store.updateTask(9, { ...input, description: "a".repeat(5001) }).ok,
    false,
  );
});

test("metadata migrates and saves labels and calendar dates", () => {
  const storage = memoryStorage();
  storage.setItem(
    TASK_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      tasks: [{ ...seed[0], labels: undefined, dueDate: undefined }],
    }),
  );
  const store = createTaskStore(seed, () => storage);
  store.load();
  assert.deepEqual(store.getSnapshot().tasks[0].labels, []);
  assert.equal(
    store.updateTask(9, { ...input, labels: ["design"], dueDate: "2026-10-06" })
      .ok,
    true,
  );
  store.load();
  assert.deepEqual(store.getSnapshot().tasks[0].labels, ["design"]);
  assert.equal(store.getSnapshot().tasks[0].dueDate, "2026-10-06");
});

test("activity records saved changes and lifecycle undo without invented migration events", () => {
  const storage = memoryStorage();
  let fail = false;
  const store = createTaskStore(
    seed,
    () => ({
      ...storage,
      setItem(key, value) {
        if (fail) throw new Error("Quota");
        storage.setItem(key, value);
      },
    }),
    () => new Date("2026-10-06T12:00:00Z"),
  );
  store.load();
  assert.deepEqual(store.getSnapshot().tasks[0].activity, []);
  store.moveTask(9, "done");
  store.moveTask(9, "done");
  store.addSubtask(9, "Check keyboard");
  store.setSubtaskCompleted(9, 1, true);
  assert.deepEqual(
    store.getSnapshot().tasks[0].activity.map((event) => event.message),
    [
      "Status changed from To do to Done",
      "Subtask added: Check keyboard",
      "Completed subtask: Check keyboard",
    ],
  );
  fail = true;
  assert.equal(store.moveTask(9, "todo").ok, false);
  assert.equal(store.getSnapshot().tasks[0].activity.length, 3);
  fail = false;
  store.deleteTask(9);
  store.restoreDeletedTask(9);
  store.load();
  assert.equal(
    store.getSnapshot().tasks[0].activity.at(-1)?.message,
    "Restored after deletion",
  );
  assert.equal(
    store.getSnapshot().tasks[0].activity[0].at,
    "2026-10-06T12:00:00.000Z",
  );
});

test("task activity retains the newest 100 entries", () => {
  const storage = memoryStorage();
  const store = createTaskStore(seed, () => storage);
  store.load();
  for (let i = 0; i < 105; i++) store.moveTask(9, i % 2 ? "todo" : "done");
  store.load();
  const activity = store.getSnapshot().tasks[0].activity;
  assert.equal(activity.length, 100);
  assert.equal(activity[0].id, 6);
  assert.equal(activity.at(-1)?.id, 105);
});

test("sprint lifecycle starts assigned backlog work and carries unfinished tasks while preserving summary", () => {
  const storage = memoryStorage();
  const store = createTaskStore(seed, () => storage);
  store.load();
  const sprint = {
    name: "Sprint 1",
    goal: "Ship planning",
    startDate: "2026-10-06",
    endDate: "2026-10-20",
  };
  assert.equal(store.createSprint(sprint).ok, true);
  assert.equal(store.createSprint({ ...sprint, name: "sprint 1" }).ok, false);
  assert.equal(store.startSprint(1).ok, false);
  store.createTask(input, "backlog");
  store.setPlacement(9, "backlog");
  assert.equal(store.assignSprint(9, 1).ok, true);
  assert.equal(store.assignSprint(10, 1).ok, true);
  assert.equal(store.startSprint(1).ok, true);
  assert(store.getSnapshot().tasks.every((task) => task.placement === "board"));
  assert.equal(store.setPlacement(9, "backlog").ok, false);
  store.createSprint({ ...sprint, name: "Sprint 2" });
  store.createTask(input);
  store.assignSprint(11, 2);
  assert.equal(store.startSprint(2).ok, false);
  store.moveTask(10, "done");
  store.addSubtask(9, "Carry child");
  assert.equal(store.completeSprint(1).ok, true);
  store.load();
  assert.deepEqual(store.getSnapshot().sprints[0].summary, {
    total: 2,
    completed: 1,
    carried: 1,
  });
  const carried = store.getSnapshot().tasks.find((task) => task.id === 9)!;
  assert.equal(carried.sprintId, null);
  assert.equal(carried.placement, "backlog");
  assert.equal(carried.status, "todo");
  assert.equal(carried.subtasks.length, 1);
  assert.equal(store.assignSprint(9, 1).ok, false);
  assert.equal(store.startSprint(2).ok, true);
  store.moveTask(10, "todo");
  assert.equal(
    store.getSnapshot().tasks.find((task) => task.id === 10)?.sprintId,
    null,
  );
  assert.equal(store.getSnapshot().sprints[0].summary?.completed, 1);
});

test("failed sprint writes keep scope and lifecycle unchanged, and invalid references protect storage", () => {
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
  store.createSprint({
    name: "Sprint",
    goal: "",
    startDate: "2026-10-06",
    endDate: "2026-10-07",
  });
  store.assignSprint(9, 1);
  fail = true;
  assert.equal(store.startSprint(1).ok, false);
  assert.equal(store.getSnapshot().sprints[0].status, "planned");
  fail = false;
  store.setArchived(9, true);
  assert.equal(store.getSnapshot().tasks[0].sprintId, null);
  assert.equal(store.assignSprint(9, 1).ok, false);
  const raw = JSON.stringify({
    version: 1,
    tasks: [{ ...seed[0], sprintId: 999 }],
  });
  storage.setItem(TASK_STORAGE_KEY, raw);
  store.load();
  assert(store.getSnapshot().error);
  assert.equal(store.createTask(input).ok, false);
  assert.equal(storage.getItem(TASK_STORAGE_KEY), raw);
});

test("undo deletion respects a sprint started while the task was deleted", () => {
  const storage = memoryStorage();
  const store = createTaskStore(seed, () => storage);
  store.load();
  store.createSprint({
    name: "Sprint",
    goal: "",
    startDate: "2026-10-06",
    endDate: "2026-10-07",
  });
  store.createTask(input, "backlog");
  store.setPlacement(9, "backlog");
  store.assignSprint(9, 1);
  store.assignSprint(10, 1);
  store.deleteTask(9);
  store.startSprint(1);
  assert.equal(store.restoreDeletedTask(9).ok, true);
  store.load();
  assert.equal(store.getSnapshot().error, null);
  assert.equal(
    store.getSnapshot().tasks.find((task) => task.id === 9)?.placement,
    "board",
  );
});

test("settings and unused members persist, and removing a member unassigns live and undo records", () => {
  const storage = memoryStorage();
  const store = createTaskStore(seed, () => storage);
  store.load();
  assert.equal(store.addMember(" Alex Rivera ").ok, true);
  assert.equal(store.addMember("alex rivera").ok, false);
  store.updateSettings({ projectName: "Orbit Studio", appearance: "sage" });
  store.updateTask(9, { ...input, assignee: "Alex Rivera" });
  store.createTask({ ...input, assignee: "Alex Rivera" });
  store.deleteTask(10);
  assert.equal(store.removeMember("Alex Rivera").ok, true);
  store.restoreDeletedTask(10);
  store.load();
  assert(store.getSnapshot().tasks.every((task) => task.assignee === null));
  assert.equal(store.getSnapshot().settings.projectName, "Orbit Studio");
  assert.equal(store.getSnapshot().settings.appearance, "sage");
  assert.equal(
    store.createTask({ ...input, assignee: "Alex Rivera" }).ok,
    false,
  );
  store.addMember("Unused member");
  store.load();
  assert.deepEqual(store.getSnapshot().settings.members, ["Unused member"]);
});

test("legacy member catalogs migrate from assignments and failed settings writes retain preferences and members", () => {
  const storage = memoryStorage();
  let fail = false;
  const assignedSeed = [{ ...seed[0], assignee: "Maya" }];
  storage.setItem(
    TASK_STORAGE_KEY,
    JSON.stringify({ version: 1, tasks: assignedSeed }),
  );
  const store = createTaskStore(assignedSeed, () => ({
    ...storage,
    setItem(key, value) {
      if (fail) throw new Error("Quota");
      storage.setItem(key, value);
    },
  }));
  store.load();
  assert.deepEqual(store.getSnapshot().settings.members, ["Maya"]);
  fail = true;
  assert.equal(
    store.updateSettings({ projectName: "New", appearance: "lavender" }).ok,
    false,
  );
  assert.equal(store.removeMember("Maya").ok, false);
  assert.equal(store.getSnapshot().settings.projectName, "Orbit");
  assert.equal(store.getSnapshot().tasks[0].assignee, "Maya");
  assert.deepEqual(store.getSnapshot().tasks[0].activity, []);
});

test("local member selection persists, validates names and clears when the member is removed", () => {
  const storage = memoryStorage();
  const store = createTaskStore(seed, () => storage);
  store.load();
  assert.equal(store.addMember("Maya").ok, true);
  assert.equal(store.selectMember("Missing").ok, false);
  assert.equal(store.selectMember("Maya").ok, true);
  const restored = createTaskStore(seed, () => storage);
  restored.load();
  assert.equal(restored.getSnapshot().settings.currentMember, "Maya");
  assert.equal(restored.removeMember("Maya").ok, true);
  assert.equal(restored.getSnapshot().settings.currentMember, null);
});
