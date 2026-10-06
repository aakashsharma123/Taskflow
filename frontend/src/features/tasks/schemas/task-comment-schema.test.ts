import test from "node:test";
import assert from "node:assert/strict";
import { commentBodySchema, taskCommentsSchema } from "./task-comment-schema";
test("comments validate bounded plain text and unique identities", () => {
  assert.equal(commentBodySchema.parse("  Update  "), "Update");
  assert.equal(commentBodySchema.safeParse(" ").success, false);
  assert.equal(commentBodySchema.safeParse("x".repeat(2001)).success, false);
  const comment = {
    id: crypto.randomUUID(),
    author: "Local user",
    body: "Update",
    createdAt: "2026-10-07T00:00:00Z",
    updatedAt: null,
  };
  assert.equal(taskCommentsSchema.safeParse([comment, comment]).success, false);
  assert.deepEqual(taskCommentsSchema.parse(undefined), []);
});
