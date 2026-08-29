import assert from "node:assert/strict";
import { parseCheckoutSource, resolvePointsToUse } from "../src/utils/checkout.ts";

assert.deepEqual(parseCheckoutSource({ cartIds: " 1,2,1 " }), { cartIds: ["1", "2"] });
assert.deepEqual(parseCheckoutSource({ skuId: "9", quantity: "3" }), {
  items: [{ skuId: "9", quantity: 3 }],
});
assert.deepEqual(parseCheckoutSource({ skuId: "9", quantity: "oops" }), {
  items: [{ skuId: "9", quantity: 1 }],
});
assert.throws(() => parseCheckoutSource({}), /请选择要结算的商品/);
assert.equal(resolvePointsToUse(true, 1863.8), 1863);
assert.equal(resolvePointsToUse(true, -1), 0);
assert.equal(resolvePointsToUse(false, 1800), 0);

console.log("checkout source checks passed");
