import test from "node:test";
import assert from "node:assert/strict";
import { createEpicSchema } from "./create-epic-schema";

test("trims epic names and rejects duplicates ignoring case", () => {
  const schema = createEpicSchema(["Workspace"]);
  assert.equal(schema.parse("  Onboarding  "), "Onboarding");
  assert.equal(schema.safeParse(" workspace ").success, false);
});

test("requires a name of at most 60 characters", () => {
  const schema = createEpicSchema([]);
  for (const name of ["", "  ", "a".repeat(61), null])
    assert.equal(schema.safeParse(name).success, false);
  assert.equal(schema.safeParse("a".repeat(60)).success, true);
});
