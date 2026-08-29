import assert from "node:assert/strict";
import { formatCountdown, remainingPeople, remainingSeconds } from "../src/utils/group-buy.ts";

assert.equal(remainingSeconds("2026-08-29T10:00:02.001Z", Date.parse("2026-08-29T10:00:00Z")), 3);
assert.equal(remainingSeconds("invalid", 0), 0);
assert.equal(formatCountdown(90061), "1天 01:01:01");
assert.equal(formatCountdown(-1), "00:00:00");
assert.equal(remainingPeople(3, 1), 2);
assert.equal(remainingPeople(2, 3), 0);

console.log("group buy checks passed");
