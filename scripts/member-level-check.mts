import assert from "node:assert/strict";
import { memberLevelProgress } from "../src/utils/member-level.ts";

const account = {
  points: 0,
  totalSpent: 2_500_000,
  level: {
    id: "1",
    name: "普通会员",
    code: "L1",
    thresholdAmount: 0,
    discountRate: 10_000,
  },
  nextLevel: {
    id: "2",
    name: "白银会员",
    code: "L2",
    thresholdAmount: 5_000_000,
    discountRate: 9_000,
  },
  levels: [],
  rule: { earnPerYuan: 1, redeemPointsPerYuan: 100, maxDeductRate: 5_000 },
};

assert.equal(memberLevelProgress(account), 50);
assert.equal(memberLevelProgress({ ...account, totalSpent: 5_000_000 }), 100);
assert.equal(memberLevelProgress({ ...account, nextLevel: null }), 100);
assert.equal(memberLevelProgress(null), 0);

console.log("member level checks passed");
