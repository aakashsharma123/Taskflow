import test from "node:test";
import assert from "node:assert/strict";
import { getInitials } from "./initials";

test("uses the first letters of the first two names", () => {
  assert.equal(getInitials("Maya Chen"), "MC");
  assert.equal(getInitials("Ana Maria de Souza"), "AM");
  assert.equal(getInitials("Jordan"), "J");
});

test("ignores extra spaces and returns capitals", () => {
  assert.equal(getInitials("  jordan   lee "), "JL");
});
