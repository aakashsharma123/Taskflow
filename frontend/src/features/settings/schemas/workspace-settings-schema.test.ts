import test from "node:test";
import assert from "node:assert/strict";
import {
  projectSettingsSchema,
  workspaceSettingsSchema,
} from "./workspace-settings-schema";
test("settings validate bounded names, appearance choices, and unique local members", () => {
  const input = {
    projectName: " Orbit ",
    appearance: "apricot",
    members: ["Alex"],
  };
  assert.equal(workspaceSettingsSchema.parse(input).projectName, "Orbit");
  for (const invalid of [
    { ...input, projectName: " " },
    { ...input, projectName: "x".repeat(61) },
    { ...input, appearance: "neon" },
    { ...input, members: ["Alex", "alex"] },
    { ...input, members: [" "] },
  ])
    assert.equal(workspaceSettingsSchema.safeParse(invalid).success, false);
  assert.equal(
    projectSettingsSchema.safeParse({
      projectName: "Orbit",
      appearance: "sage",
    }).success,
    true,
  );
});
