<template>
  <YjPage :padded="false">
    <view v-if="focusMode" class="gift-content">
      <view class="gift-hero" :class="{ 'gift-hero--received': token }">
        <text class="gift-hero__title">{{ focusTitle }}</text>
        <text class="gift-hero__subtitle">{{ focusSubtitle }}</text>
      </view>

      <view v-if="focusLoading" class="gift-state">
        <wd-loading size="48rpx" />
        <text>加载中</text>
      </view>
      <YjEmpty v-else-if="focusError" image="content" :text="focusError">
        <view class="gift-link" @click="reloadFocus">重新加载</view>
      </YjEmpty>
      <template v-else-if="focusItems.length">
        <view class="gift-card">
          <view class="gift-card__head">
            <view>
              <text class="gift-card__label">整单赠礼</text>
              <text class="gift-card__status">{{ focusStatus }}</text>
            </view>
            <text class="gift-card__privacy">金额已隐藏</text>
          </view>
          <OrderGiftItems :items="focusItems" />
          <view class="gift-card__meta">{{ focusMeta }}</view>
        </view>

        <view v-if="token" class="gift-actions">
          <wd-button
            v-if="!claimedGift && preview?.canClaim"
            type="primary"
            block
            size="large"
            :loading="claiming"
            @click="claimGift"
          >
            领取礼物
          </wd-button>
          <wd-button
            v-if="claimedGift?.canBookAppointment"
            type="primary"
            block
            size="large"
            @click="openAppointment(claimedGift.orderId)"
          >
            去预约
          </wd-button>
          <wd-button type="info" plain block @click="openRecords('RECEIVED')">
            查看我的赠礼
          </wd-button>
        </view>

        <view v-else-if="order" class="gift-actions">
          <template v-if="createdShare">
            <view class="gift-notice">赠礼已生成，请在页面关闭前完成分享</view>
            <!-- #ifdef MP-WEIXIN -->
            <wd-button type="primary" block size="large" open-type="share">分享给好友</wd-button>
            <!-- #endif -->
            <!-- #ifdef H5 -->
            <wd-button type="primary" block size="large" @click="copyShareLink">
              复制领取链接
            </wd-button>
            <!-- #endif -->
            <wd-button
              type="info"
              plain
              block
              :loading="actionGiftId === createdShare.id"
              @click="revokeCreatedGift"
            >
              撤回赠礼
            </wd-button>
          </template>
          <wd-button
            v-else
            type="primary"
            block
            size="large"
            :disabled="!order.canGift"
            :loading="creating"
            @click="createGift"
          >
            {{ order.canGift ? "生成赠礼" : "当前订单不可赠送" }}
          </wd-button>
          <wd-button type="info" plain block @click="openRecords('SENT')"> 查看转赠记录 </wd-button>
        </view>
      </template>
    </view>

    <view v-else>
      <view class="gift-tabs">
        <view
          v-for="tab in directionTabs"
          :key="tab.value"
          class="gift-tabs__item"
          :class="{ 'is-active': direction === tab.value }"
          @click="selectDirection(tab.value)"
        >
          {{ tab.label }}
        </view>
      </view>

      <view class="gift-content">
        <view v-if="recordsLoading && records.length === 0" class="gift-state">
          <wd-loading size="48rpx" />
        </view>
        <YjEmpty
          v-else-if="recordsError && records.length === 0"
          image="network"
          :text="recordsError"
        >
          <view class="gift-link" @click="loadRecords(true)">重新加载</view>
        </YjEmpty>
        <YjEmpty v-else-if="records.length === 0" :text="emptyRecordsText" />
        <template v-else>
          <view v-for="record in records" :key="record.id" class="gift-card">
            <view class="gift-card__head">
              <view>
                <text class="gift-card__label">{{ counterpartText(record) }}</text>
                <text class="gift-card__status">{{ record.statusLabel }}</text>
              </view>
              <text class="gift-card__privacy">金额已隐藏</text>
            </view>
            <OrderGiftItems :items="record.items" />
            <view class="gift-card__meta">{{ recordTimeText(record) }}</view>
            <view
              v-if="record.canRevoke || record.canReturnGift || record.canBookAppointment"
              class="gift-card__actions"
            >
              <wd-button
                v-if="record.canRevoke"
                type="info"
                plain
                size="small"
                :loading="actionGiftId === record.id"
                @click="changeRecord(record, 'revoke')"
              >
                撤回
              </wd-button>
              <wd-button
                v-if="record.canReturnGift"
                type="info"
                plain
                size="small"
                :loading="actionGiftId === record.id"
                @click="changeRecord(record, 'return')"
              >
                退回赠礼
              </wd-button>
              <wd-button
                v-if="record.canBookAppointment"
                type="primary"
                size="small"
                @click="openAppointment(record.orderId)"
              >
                去预约
              </wd-button>
            </view>
          </view>
          <view v-if="recordsLoading" class="gift-more">加载中...</view>
          <view v-else-if="recordsFinished" class="gift-more">没有更多了</view>
        </template>
      </view>
    </view>

    <YjAppointmentDrawer
      v-model:visible="appointmentVisible"
      :order-id="appointmentOrderId"
      @success="handleAppointmentSuccess"
    />
  </YjPage>
</template>

<script setup lang="ts">
import { AppointmentTab } from "@/api/appointment";
import OrderGiftAPI, {
  type OrderGiftDirection,
  type OrderGiftItem,
  type OrderGiftPreview,
  type OrderGiftRecord,
  type OrderGiftShare,
} from "@/api/order-gift";
import OrderAPI, { type OrderDetail } from "@/api/order";
import { RoutePath } from "@/constants";
import { isLoggedIn } from "@/utils/auth";
import { formatDate } from "@/utils/format";
import { navigate } from "@/utils/navigate";
import OrderGiftItems from "./components/OrderGiftItems.vue";

const PAGE_SIZE = 10;
const directionTabs: Array<{ value: OrderGiftDirection; label: string }> = [
  { value: "SENT", label: "我送出的" },
  { value: "RECEIVED", label: "我收到的" },
];

const token = ref("");
const orderId = ref("");
const direction = ref<OrderGiftDirection>("SENT");
const preview = ref<OrderGiftPreview>();
const claimedGift = ref<OrderGiftRecord>();
const order = ref<OrderDetail>();
const createdShare = ref<OrderGiftShare>();
const previewLoading = ref(false);
const orderLoading = ref(false);
const previewError = ref("");
const orderError = ref("");
const claiming = ref(false);
const creating = ref(false);

const records = ref<OrderGiftRecord[]>([]);
const recordsLoading = ref(false);
const recordsFinished = ref(false);
const recordsError = ref("");
const pageNum = ref(1);
const actionGiftId = ref("");
const appointmentVisible = ref(false);
const appointmentOrderId = ref("");
let recordsRequestSequence = 0;

const receivedGift = computed(() => claimedGift.value || preview.value);
const focusMode = computed(() => Boolean(token.value || orderId.value));
const focusLoading = computed(() => (token.value ? previewLoading.value : orderLoading.value));
const focusError = computed(() => (token.value ? previewError.value : orderError.value));
const focusItems = computed<OrderGiftItem[]>(() =>
  token.value ? receivedGift.value?.items || [] : order.value?.items || []
);
const focusStatus = computed(() =>
  token.value ? receivedGift.value?.statusLabel || "" : order.value?.statusLabel || ""
);
const focusTitle = computed(() => {
  if (!token.value) return "把美好送给重要的人";
  if (claimedGift.value) return "赠礼领取成功";
  return `${preview.value?.senderNickname || "好友"}送你一份悦己礼物`;
});
const focusSubtitle = computed(() =>
  token.value ? "心意无价，赠礼页面不展示订单金额" : "领取后由好友预约使用"
);
const focusMeta = computed(() => {
  if (!token.value) return "领取前可撤回，分享链接 7 天内有效";
  return receivedGift.value ? `领取有效期至 ${formatGiftDate(receivedGift.value.expiresAt)}` : "";
});
const emptyRecordsText = computed(() =>
  direction.value === "SENT" ? "暂无送出的赠礼" : "暂无收到的赠礼"
);

function formatGiftDate(value: string): string {
  return formatDate(value, "YYYY-MM-DD HH:mm");
}

function counterpartText(record: OrderGiftRecord): string {
  if (record.direction === "RECEIVED") return `${record.senderNickname || "好友"}送给你`;
  return record.recipientNickname ? `已分享给 ${record.recipientNickname}` : "等待好友领取";
}

function recordTimeText(record: OrderGiftRecord): string {
  if (record.returnedAt) return `退回时间 ${formatGiftDate(record.returnedAt)}`;
  if (record.revokedAt) return `撤回时间 ${formatGiftDate(record.revokedAt)}`;
  if (record.claimedAt) return `领取时间 ${formatGiftDate(record.claimedAt)}`;
  return `有效期至 ${formatGiftDate(record.expiresAt)}`;
}

async function loadPreview(): Promise<void> {
  if (!token.value || previewLoading.value) return;
  previewLoading.value = true;
  previewError.value = "";
  try {
    preview.value = await OrderGiftAPI.preview(token.value);
  } catch {
    preview.value = undefined;
    previewError.value = "礼物不存在或已失效";
  } finally {
    previewLoading.value = false;
  }
}

async function claimGift(): Promise<void> {
  if (!preview.value?.canClaim || claiming.value) return;
  if (!isLoggedIn()) {
    navigate(RoutePath.ORDER_GIFT, { requireAuth: true, params: { token: token.value } });
    return;
  }
  claiming.value = true;
  try {
    claimedGift.value = await OrderGiftAPI.claim(token.value);
    preview.value = { ...preview.value, canClaim: false, statusLabel: "已领取" };
    uni.showToast({ title: "领取成功", icon: "success" });
  } finally {
    claiming.value = false;
  }
}

async function loadOrder(): Promise<void> {
  if (!orderId.value || orderLoading.value) return;
  orderLoading.value = true;
  orderError.value = "";
  try {
    order.value = await OrderAPI.getDetail(orderId.value);
  } catch (error) {
    orderError.value = error instanceof Error ? error.message : "订单加载失败";
  } finally {
    orderLoading.value = false;
  }
}

async function createGift(): Promise<void> {
  if (!order.value?.canGift || creating.value) return;
  creating.value = true;
  try {
    createdShare.value = await OrderGiftAPI.create(order.value.id);
  } finally {
    creating.value = false;
  }
}

function sharePath(): string {
  return `${RoutePath.ORDER_GIFT}?token=${encodeURIComponent(createdShare.value?.token || "")}`;
}

function copyShareLink(): void {
  if (!createdShare.value?.token) return;
  // #ifdef H5
  uni.setClipboardData({
    data: `${window.location.origin}${window.location.pathname}#${sharePath()}`,
  });
  // #endif
}

async function revokeCreatedGift(): Promise<void> {
  if (!createdShare.value) return;
  const { confirm } = await uni.showModal({
    title: "撤回赠礼",
    content: "撤回后当前领取链接将立即失效，确认撤回吗？",
    confirmText: "确认撤回",
  });
  if (!confirm) return;
  actionGiftId.value = createdShare.value.id;
  try {
    await OrderGiftAPI.revoke(createdShare.value.id);
    createdShare.value = undefined;
    if (order.value) order.value.canGift = true;
    uni.showToast({ title: "已撤回", icon: "success" });
  } finally {
    actionGiftId.value = "";
  }
}

function openRecords(nextDirection: OrderGiftDirection): void {
  navigate(RoutePath.ORDER_GIFT, {
    redirect: true,
    requireAuth: true,
    params: { direction: nextDirection },
  });
}

function selectDirection(nextDirection: OrderGiftDirection): void {
  if (direction.value === nextDirection) return;
  direction.value = nextDirection;
  void loadRecords(true);
}

async function loadRecords(reset = false): Promise<void> {
  if (!reset && (recordsLoading.value || recordsFinished.value)) return;
  const sequence = reset ? ++recordsRequestSequence : recordsRequestSequence;
  if (reset) {
    records.value = [];
    recordsError.value = "";
    recordsFinished.value = false;
    pageNum.value = 1;
  }
  recordsLoading.value = true;
  const requestedPage = pageNum.value;
  try {
    const result = await OrderGiftAPI.getPage({
      direction: direction.value,
      pageNum: requestedPage,
      pageSize: PAGE_SIZE,
    });
    if (sequence !== recordsRequestSequence) return;
    records.value.push(...result.list);
    recordsFinished.value = records.value.length >= result.total;
    pageNum.value = requestedPage + 1;
  } catch (error) {
    if (sequence !== recordsRequestSequence) return;
    recordsError.value = error instanceof Error ? error.message : "赠礼记录加载失败";
  } finally {
    if (sequence === recordsRequestSequence) recordsLoading.value = false;
  }
}

async function changeRecord(record: OrderGiftRecord, action: "revoke" | "return"): Promise<void> {
  const isReturn = action === "return";
  const { confirm } = await uni.showModal({
    title: isReturn ? "退回赠礼" : "撤回赠礼",
    content: isReturn
      ? "退回后你将不能预约或使用此订单，确认退回吗？"
      : "撤回后好友将无法领取，确认撤回吗？",
    confirmText: isReturn ? "确认退回" : "确认撤回",
  });
  if (!confirm) return;
  actionGiftId.value = record.id;
  try {
    const updated = isReturn
      ? await OrderGiftAPI.returnGift(record.id)
      : await OrderGiftAPI.revoke(record.id);
    records.value = records.value.map((item) => (item.id === updated.id ? updated : item));
    uni.showToast({ title: isReturn ? "已退回" : "已撤回", icon: "success" });
  } finally {
    actionGiftId.value = "";
  }
}

function openAppointment(nextOrderId: string): void {
  appointmentOrderId.value = nextOrderId;
  appointmentVisible.value = true;
}

async function handleAppointmentSuccess(): Promise<void> {
  if (claimedGift.value) {
    claimedGift.value = {
      ...claimedGift.value,
      canBookAppointment: false,
      canReturnGift: false,
    };
  } else if (!focusMode.value) {
    await loadRecords(true);
  }
  const { confirm } = await uni.showModal({
    title: "预约成功",
    content: "已为你保留到店时间。",
    cancelText: "留在赠礼页",
    confirmText: "查看预约",
  });
  if (confirm) navigate(RoutePath.APPOINTMENT, { params: { tab: AppointmentTab.PENDING_ARRIVAL } });
}

function reloadFocus(): void {
  if (token.value) void loadPreview();
  else void loadOrder();
}

onShareAppMessage(() => ({
  title: createdShare.value?.token ? "送你一份悦己礼物" : "悦己 DLumière",
  path: createdShare.value?.token ? sharePath() : undefined,
  imageUrl: createdShare.value?.items[0]?.productImage || undefined,
}));

onLoad((options) => {
  token.value = options?.token ? String(options.token) : "";
  orderId.value = options?.orderId ? String(options.orderId) : "";
  direction.value = options?.direction === "RECEIVED" ? "RECEIVED" : "SENT";
  if (token.value) void loadPreview();
  else if (orderId.value) void loadOrder();
  else void loadRecords(true);
});

onReachBottom(() => {
  if (!focusMode.value) void loadRecords();
});

onPullDownRefresh(async () => {
  if (token.value) await loadPreview();
  else if (orderId.value) await loadOrder();
  else await loadRecords(true);
  uni.stopPullDownRefresh();
});
</script>

<style lang="scss" scoped>
.gift-content {
  padding: $spacing-md $page-padding 48rpx;
}

.gift-hero {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  padding: 48rpx $spacing-md;
  color: $color-bg;
  text-align: center;
  background: linear-gradient(145deg, $color-primary-dark, $color-primary-light);
  border-radius: $radius-card;

  &--received {
    background: linear-gradient(145deg, #6b4133, #b78168);
  }
}

.gift-hero__title {
  font-size: $font-size-xl;
  font-weight: 700;
}

.gift-hero__subtitle {
  font-size: $font-size-sm;
  color: rgb(255 255 255 / 82%);
}

.gift-state {
  display: flex;
  gap: $spacing-sm;
  align-items: center;
  justify-content: center;
  min-height: 300rpx;
  color: $color-text-placeholder;
}

.gift-link {
  padding: $spacing-sm $spacing-lg;
  margin-top: $spacing-md;
  color: $color-primary;
  border: 2rpx solid $color-primary;
  border-radius: $radius-button;
}

.gift-card {
  padding: $spacing-md;
  margin-top: $spacing-md;
  background: $color-bg;
  border-radius: $radius-card;
}

.gift-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: $spacing-md;
  border-bottom: 2rpx solid $color-line;
}

.gift-card__label,
.gift-card__status {
  display: block;
}

.gift-card__label,
.gift-card__meta {
  font-size: $font-size-sm;
  color: $color-text-sub;
}

.gift-card__status {
  margin-top: $spacing-xs;
  font-weight: 600;
  color: $color-primary;
}

.gift-card__privacy {
  padding: 6rpx 12rpx;
  font-size: $font-size-xs;
  color: $color-primary;
  background: $color-primary-tint;
  border-radius: $radius-tag;
}

.gift-card__meta {
  padding-top: $spacing-sm;
  border-top: 2rpx solid $color-line;
}

.gift-actions {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  margin-top: $spacing-lg;
}

.gift-notice {
  font-size: $font-size-sm;
  color: $color-text-sub;
  text-align: center;
}

.gift-tabs {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  height: 88rpx;
  background: $color-bg;
  border-bottom: 2rpx solid $color-line;
}

.gift-tabs__item {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  color: $color-text-sub;

  &.is-active {
    font-weight: 600;
    color: $color-primary;
    border-bottom: 4rpx solid $color-primary;
  }
}

.gift-card__actions {
  display: flex;
  gap: $spacing-sm;
  justify-content: flex-end;
  padding-top: $spacing-md;
  border-top: 2rpx solid $color-line;
}

.gift-more {
  padding: $spacing-md 0;
  font-size: $font-size-sm;
  color: $color-text-placeholder;
  text-align: center;
}
</style>
