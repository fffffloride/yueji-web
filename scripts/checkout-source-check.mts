import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

const confirmPage = readFileSync("src/pages-sub/order/confirm/index.vue", "utf8");
assert.match(confirmPage, /好友代付/);
assert.match(confirmPage, /async function ensureOrderCreated/);
assert.match(
  confirmPage,
  /if \(mode === "proxy"\)[\s\S]{0,180}RoutePath\.ORDER_PROXY_PAY/
);
assert.match(confirmPage, /await continuePayment\(order\)/);

console.log("checkout source checks passed");
