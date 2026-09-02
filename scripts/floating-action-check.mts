import assert from "node:assert/strict";
import { snapToHorizontalEdge } from "../src/utils/floating-action.ts";

assert.equal(snapToHorizontalEdge(30, 300, 12), 12);
assert.equal(snapToHorizontalEdge(151, 300, 12), 288);
assert.equal(snapToHorizontalEdge(0, -1, 12), 0);
assert.equal(snapToHorizontalEdge(10, 20, 40), 10);

console.log("floating action checks passed");
