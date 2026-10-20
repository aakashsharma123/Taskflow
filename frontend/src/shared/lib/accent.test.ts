import test from "node:test";
import assert from "node:assert/strict";
import { accentAt, pickAccent } from "./accent";

test("gives the first five positions different accents, then repeats", () => {
  const firstFive = [0, 1, 2, 3, 4].map(accentAt);
  assert.equal(new Set(firstFive).size, 5);
  assert.equal(accentAt(5), accentAt(0));
});

test("picks the same accent for the same name, ignoring case", () => {
  assert.equal(pickAccent("Maya Chen"), pickAccent("maya chen"));
});
