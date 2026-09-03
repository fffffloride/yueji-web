import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const giftPage = readFileSync("src/pages-sub/order/gift/index.vue", "utf8");
const giftTypes = readFileSync("src/api/order-gift/types.ts", "utf8");
const orderCard = readFileSync("src/components/YjOrderCard.vue", "utf8");
const request = readFileSync("src/utils/request.ts", "utf8");

assert.doesNotMatch(giftPage, /formatPrice|payAmount|totalAmount|discountAmount|subtotal/);
assert.doesNotMatch(giftTypes, /\b(price|amount|contact|mobile|orderNo)\b/i);
assert.match(orderCard, /v-if="!isGiftRecipient && item\.price !== undefined"/);
assert.match(orderCard, /v-if="isGiftRecipient"[^>]*>赠礼金额已隐藏/);
assert.match(giftPage, /onShareAppMessage/);
assert.match(giftPage, /OrderGiftAPI\.claim/);
assert.match(giftPage, /OrderGiftAPI\.revoke/);
assert.match(giftPage, /OrderGiftAPI\.returnGift/);
assert.match(giftPage, /openAppointment\(record\.orderId\)/);
assert.match(request, /from: currentPageUrl\(\)/);

console.log("order gift checks passed");
