import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const marketingApi = readFileSync("src/api/marketing/index.ts", "utf8");
const empty = readFileSync("src/components/YjEmpty.vue", "utf8");
const points = readFileSync("src/pages-sub/user/points/index.vue", "utf8");
const product = readFileSync("src/pages/product/index.vue", "utf8");
const appointmentDrawer = readFileSync("src/components/YjAppointmentDrawer.vue", "utf8");
const gift = readFileSync("src/pages-sub/order/gift/index.vue", "utf8");

assert.doesNotMatch(marketingApi, /ServerPageResult|toPageResult/);
assert.equal((marketingApi.match(/request<PageResult</g) ?? []).length, 3);
assert.match(empty, /\/static\/empty-state\.png/);
assert.match(empty, /image === ['"]content['"]/);
assert.match(points, /完成消费后，积分变化会显示在这里/);
assert.doesNotMatch(product, /product-catalog__section-empty/);
assert.match(appointmentDrawer, /<YjEmpty[^>]*compact[^>]*当日暂无可预约时间/);
assert.doesNotMatch(gift, /focusError[^>]*image="content"/);

console.log("empty state checks passed");
