import assert from "node:assert/strict";

import { findActiveAnchor } from "../src/utils/catalog-scroll.ts";

const anchors = [
  { id: "a", top: 20 },
  { id: "b", top: 100 },
  { id: "c", top: 240 },
];

assert.equal(findActiveAnchor([], 0), "");
assert.equal(findActiveAnchor(anchors, 0), "a");
assert.equal(findActiveAnchor(anchors, 100), "b");
assert.equal(findActiveAnchor(anchors, 999), "c");
assert.equal(findActiveAnchor(anchors, 100, true), "c");
