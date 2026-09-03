import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync("src/pages-sub/order/detail/index.vue", "utf8");

for (const section of ["项目清单", "到店服务", "联系信息", "金额明细", "订单信息"]) {
  assert.match(page, new RegExp(section));
}
for (const status of ["UNPAID", "PAID", "VERIFIED", "COMPLETED", "CANCELLED", "REFUNDED"]) {
  assert.match(page, new RegExp(`OrderStatusEnum\\.${status}`));
}
for (const action of ["cancelOrder", "continuePayment", "openProxyPay", "openGift"]) {
  assert.match(page, new RegExp(action));
}
assert.match(page, /YjAppointmentDrawer/);
assert.match(page, /viewerRole === "BENEFICIARY"/);

console.log("order detail checks passed");
