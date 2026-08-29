import assert from "node:assert/strict";
import { parseCheckoutSource } from "../src/utils/checkout.ts";

assert.deepEqual(parseCheckoutSource({ cartIds: " 1,2,1 " }), { cartIds: ["1", "2"] });
assert.deepEqual(parseCheckoutSource({ skuId: "9", quantity: "3" }), {
  items: [{ skuId: "9", quantity: 3 }],
});
assert.deepEqual(parseCheckoutSource({ skuId: "9", quantity: "oops" }), {
  items: [{ skuId: "9", quantity: 1 }],
});
assert.throws(() => parseCheckoutSource({}), /请选择要结算的商品/);

console.log("checkout source checks passed");
