import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync("src/pages-sub/order/proxy-pay/index.vue", "utf8");
const template = page.slice(0, page.indexOf("<script setup"));
const types = readFileSync("src/api/proxy-pay/types.ts", "utf8");
const payment = readFileSync("src/utils/payment.ts", "utf8");
const confirm = readFileSync("src/pages-sub/order/confirm/index.vue", "utf8");
const orderList = readFileSync("src/pages-sub/order/list/index.vue", "utf8");
const groupBuy = readFileSync("src/pages-sub/marketing/group-buy-detail/index.vue", "utf8");

assert.doesNotMatch(template, /contact|mobile|orderNo|paymentNo/i);
assert.match(
  template,
  /v-if="ownerMode && preview\.status === ProxyPayStatus\.PAID"[\s\S]{0,180}去预约/
);
assert.doesNotMatch(
  template.match(
    /v-else-if="preview\.status === ProxyPayStatus\.PAID && !ownerMode"[\s\S]*?<\/template>/
  )?.[0] ?? "",
  /预约/
);
assert.doesNotMatch(types, /contact|mobile|orderNo/i);
assert.match(page, /setInterval\(\(\) => void loadStatus\(\), 2000\)/);
assert.match(page, /onHide\([\s\S]*stopPolling/);
assert.match(page, /onUnload\([\s\S]*stopPolling/);
assert.match(page, /onShareAppMessage/);
assert.match(page, /createCanvasContext/);
assert.match(payment, /uni\.requestPayment/);
for (const source of [confirm, orderList, groupBuy]) {
  assert.match(source, /invokeWechatPayment\(payment\)/);
}

console.log("proxy pay checks passed");
