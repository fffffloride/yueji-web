<template>
  <YjPage :padded="false" :has-footer="Boolean(preview && !loading)">
    <view v-if="loading" class="proxy-state">
      <wd-loading />
      <text>{{ ownerMode ? "正在生成代付邀请" : "正在加载代付信息" }}</text>
    </view>

    <view v-else-if="loadError || !preview" class="proxy-state">
      <YjEmpty image="network" :text="loadError || '代付邀请不存在'">
        <wd-button size="small" type="primary" @click="loadPage">重新加载</wd-button>
      </YjEmpty>
    </view>

    <template v-else>
      <view class="proxy-content">
        <view class="proxy-hero" :class="`proxy-hero--${statusTone}`">
          <view class="proxy-hero__icon">{{ statusIcon }}</view>
          <view class="proxy-hero__title">{{ heroTitle }}</view>
          <view class="proxy-hero__hint">{{ heroHint }}</view>
          <view v-if="!terminal" class="proxy-hero__countdown"> 剩余 {{ expiryCountdown }} </view>
        </view>

        <view class="proxy-card">
          <view class="proxy-card__head">
            <view>
              <view class="proxy-card__eyebrow">代付项目</view>
              <view class="proxy-card__title">
                {{ ownerMode ? "请好友帮忙完成付款" : `${ownerName}的代付邀请` }}
              </view>
            </view>
            <text class="proxy-card__status">{{ preview.statusLabel }}</text>
          </view>

          <view v-for="item in preview.items" :key="item.id" class="proxy-item">
            <image
              v-if="item.productImage && !failedImageIds.includes(item.id)"
              class="proxy-item__image"
              :src="item.productImage"
              mode="aspectFill"
              @error="failedImageIds.push(item.id)"
            />
            <view v-else class="proxy-item__image proxy-item__image--empty">悦己</view>
            <view class="proxy-item__content">
              <text class="proxy-item__name">{{ item.productName }}</text>
              <text v-if="item.skuName" class="proxy-item__sku">{{ item.skuName }}</text>
              <text class="proxy-item__quantity">数量 ×{{ item.quantity }}</text>
            </view>
          </view>

          <view class="proxy-total">
            <text>待支付</text>
            <text class="proxy-total__amount">{{ formatPrice(preview.payAmount, true) }}</text>
          </view>
        </view>

        <view class="proxy-privacy">
          <view class="proxy-privacy__mark">i</view>
          <text>为保护隐私，本页不展示联系人、手机号和完整订单号。</text>
        </view>

        <view v-if="statusError && !terminal" class="proxy-refresh-error">
          状态暂未更新，将继续自动重试
        </view>
      </view>

      <canvas
        id="proxyPayPoster"
        canvas-id="proxyPayPoster"
        class="proxy-poster-canvas"
        width="600"
        height="840"
      />

      <YjAppointmentDrawer
        v-model:visible="appointmentVisible"
        :order-id="orderId"
        @success="handleAppointmentSuccess"
      />
    </template>

    <template #footer>
      <view v-if="preview && !loading" class="proxy-actions">
        <template v-if="ownerMode && !terminal">
          <!-- #ifdef MP-WEIXIN -->
          <button class="proxy-share-button" open-type="share">发送给微信好友</button>
          <!-- #endif -->
          <!-- #ifndef MP-WEIXIN -->
          <wd-button type="primary" block @click="copyShareLink">复制代付链接</wd-button>
          <!-- #endif -->
          <wd-button type="primary" plain block :loading="posterLoading" @click="generatePoster">
            生成代付海报
          </wd-button>
        </template>

        <template v-else-if="!ownerMode && !terminal">
          <wd-button
            type="primary"
            block
            :loading="paying"
            :disabled="paying || !preview.canPay"
            @click="pay"
          >
            {{ preview.status === ProxyPayStatus.PAYING ? "继续付款" : "帮好友付款" }}
          </wd-button>
          <text class="proxy-actions__hint">付款后项目仍归购买人所有</text>
        </template>

        <template v-else-if="preview.status === ProxyPayStatus.PAID && !ownerMode">
          <wd-button type="primary" block @click="finish">完成</wd-button>
          <wd-button type="primary" plain block @click="goHome">返回首页</wd-button>
        </template>

        <template v-else>
          <wd-button
            v-if="ownerMode && preview.status === ProxyPayStatus.PAID"
            type="primary"
            block
            @click="appointmentVisible = true"
          >
            去预约
          </wd-button>
          <wd-button v-if="ownerMode" type="primary" block @click="viewOrder">查看订单</wd-button>
          <wd-button type="primary" plain block @click="goHome">返回首页</wd-button>
        </template>
      </view>
    </template>
  </YjPage>
</template>

<script setup lang="ts">
import { AppointmentTab } from "@/api/appointment";
import PayAPI from "@/api/pay";
import ProxyPayAPI, {
  ProxyPayStatus,
  type ProxyPayPreview,
  type ProxyPayStatusInfo,
} from "@/api/proxy-pay";
import { useLogin } from "@/composables/useLogin";
import { RoutePath } from "@/constants";
import { buildQuery, formatPrice } from "@/utils/format";
import { formatCountdown, remainingSeconds } from "@/utils/group-buy";
import { goBack, navigate } from "@/utils/navigate";
import { invokeWechatPayment } from "@/utils/payment";

const CANVAS_ID = "proxyPayPoster";
const TERMINAL_STATUSES = new Set<ProxyPayStatus>([
  ProxyPayStatus.PAID,
  ProxyPayStatus.REFUNDED,
  ProxyPayStatus.CANCELLED,
  ProxyPayStatus.EXPIRED,
]);

const orderId = ref("");
const token = ref("");
const preview = ref<ProxyPayPreview>();
const loading = ref(false);
const paying = ref(false);
const posterLoading = ref(false);
const statusLoading = ref(false);
const loadError = ref("");
const statusError = ref("");
const appointmentVisible = ref(false);
const failedImageIds = ref<string[]>([]);
const now = ref(Date.now());
const pageVisible = ref(false);

const { ensureLogin } = useLogin();
let pollTimer: ReturnType<typeof setInterval> | undefined;
let clockTimer: ReturnType<typeof setInterval> | undefined;

const ownerMode = computed(() => Boolean(orderId.value));
const terminal = computed(() =>
  preview.value ? TERMINAL_STATUSES.has(preview.value.status) : false
);
const ownerName = computed(() => preview.value?.ownerNickname?.trim() || "好友");
const expiryCountdown = computed(() =>
  preview.value ? formatCountdown(remainingSeconds(preview.value.expiresAt, now.value)) : "00:00:00"
);
const statusTone = computed(() => {
  if (preview.value?.status === ProxyPayStatus.PAID) return "success";
  if (
    preview.value?.status === ProxyPayStatus.REFUNDED ||
    preview.value?.status === ProxyPayStatus.CANCELLED ||
    preview.value?.status === ProxyPayStatus.EXPIRED
  )
    return "muted";
  if (preview.value?.status === ProxyPayStatus.PAYING) return "paying";
  return "waiting";
});
const statusIcon = computed(() => {
  if (preview.value?.status === ProxyPayStatus.PAID) return "✓";
  if (terminal.value) return "×";
  return preview.value?.status === ProxyPayStatus.PAYING ? "…" : "¥";
});
const heroTitle = computed(() => {
  if (preview.value?.status === ProxyPayStatus.PAID)
    return ownerMode.value ? "好友已完成代付" : "已帮好友完成付款";
  if (preview.value?.status === ProxyPayStatus.REFUNDED) return "订单已退款";
  if (preview.value?.status === ProxyPayStatus.CANCELLED) return "订单已取消";
  if (preview.value?.status === ProxyPayStatus.EXPIRED) return "代付邀请已过期";
  if (preview.value?.status === ProxyPayStatus.PAYING) return "正在等待付款";
  return ownerMode.value ? "邀请好友代付" : `${ownerName.value}请你帮忙付款`;
});
const heroHint = computed(() => {
  if (preview.value?.status === ProxyPayStatus.PAID)
    return ownerMode.value ? "订单已支付，可返回订单查看最新状态" : "心意已送达，无需再做其他操作";
  if (terminal.value) return "当前邀请已结束，不能继续付款";
  if (preview.value?.status === ProxyPayStatus.PAYING) return "支付状态会在本页自动更新";
  return ownerMode.value ? "分享后好友即可使用微信付款" : "确认项目和金额后完成付款";
});

function sharePath(): string {
  return `${RoutePath.ORDER_PROXY_PAY}${buildQuery({ token: token.value })}`;
}

function mergeStatus(status: ProxyPayStatusInfo): void {
  if (!preview.value) return;
  preview.value = { ...preview.value, ...status };
  if (TERMINAL_STATUSES.has(status.status)) stopPolling();
}

async function loadStatus(): Promise<void> {
  if (!token.value || statusLoading.value || terminal.value) return;
  statusLoading.value = true;
  try {
    mergeStatus(await ProxyPayAPI.getStatus(token.value));
    statusError.value = "";
  } catch (error) {
    statusError.value = error instanceof Error ? error.message : "状态查询失败";
  } finally {
    statusLoading.value = false;
  }
}

function stopPolling(): void {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = undefined;
}

function startPolling(): void {
  stopPolling();
  if (!pageVisible.value || !token.value || terminal.value) return;
  pollTimer = setInterval(() => void loadStatus(), 2000);
}

async function loadPage(): Promise<void> {
  if (loading.value) return;
  loading.value = true;
  loadError.value = "";
  statusError.value = "";
  try {
    if (ownerMode.value && !token.value) {
      token.value = (await ProxyPayAPI.createShare(orderId.value)).token;
    }
    if (!token.value) throw new Error("代付参数不完整");
    preview.value = await ProxyPayAPI.preview(token.value);
    if (!terminal.value) startPolling();
  } catch (error) {
    preview.value = undefined;
    loadError.value = error instanceof Error ? error.message : "代付邀请加载失败";
  } finally {
    loading.value = false;
  }
}

async function pay(): Promise<void> {
  if (!preview.value?.canPay || terminal.value || paying.value) return;
  if (!ensureLogin(sharePath())) return;
  paying.value = true;
  try {
    const payment = await ProxyPayAPI.createPayment(token.value);
    const result = await invokeWechatPayment(payment);
    if (result === "unavailable" && import.meta.env.DEV && payment.channel === "mock") {
      await PayAPI.confirmMock(payment.paymentNo);
    }
    await loadStatus();
    startPolling();
  } finally {
    paying.value = false;
  }
}

function copyShareLink(): void {
  if (!token.value) return;
  // #ifdef H5
  uni.setClipboardData({
    data: `${window.location.origin}${window.location.pathname}#${sharePath()}`,
  });
  // #endif
}

async function imagePath(src?: string | null): Promise<string | undefined> {
  if (!src) return undefined;
  try {
    return (await uni.getImageInfo({ src })).path;
  } catch {
    return undefined;
  }
}

async function posterCodePath(buffer: ArrayBuffer): Promise<string> {
  let result = "";
  // #ifdef MP-WEIXIN
  const filePath = `${wx.env.USER_DATA_PATH}/proxy-pay-code.png`;
  await new Promise<void>((resolve, reject) => {
    wx.getFileSystemManager().writeFile({
      filePath,
      data: buffer,
      success: () => resolve(),
      fail: reject,
    });
  });
  result = filePath;
  // #endif

  // #ifndef MP-WEIXIN
  result = `data:image/png;base64,${uni.arrayBufferToBase64(buffer)}`;
  // #endif
  return result;
}

function drawPoster(productPath: string | undefined, codePath: string): Promise<void> {
  const context = uni.createCanvasContext(CANVAS_ID);
  context.setFillStyle("#f2f6f3");
  context.fillRect(0, 0, 600, 840);
  context.setFillStyle("#1a3a28");
  context.fillRect(0, 0, 600, 150);
  context.setFillStyle("#ffffff");
  context.setFontSize(24);
  context.fillText("悦己 DLumière", 40, 58);
  context.setFontSize(34);
  context.fillText("请你帮忙完成付款", 40, 110);

  context.setFillStyle("#ffffff");
  context.fillRect(30, 170, 540, 630);
  if (productPath) context.drawImage(productPath, 50, 195, 500, 260);
  else {
    context.setFillStyle("#e9f2ec");
    context.fillRect(50, 195, 500, 260);
    context.setFillStyle("#2d5a3d");
    context.setFontSize(34);
    context.fillText("悦己精选项目", 190, 340);
  }

  const item = preview.value?.items[0];
  context.setFillStyle("#1a1a1a");
  context.setFontSize(28);
  context.fillText((item?.productName || "悦己精选项目").slice(0, 18), 50, 510, 500);
  context.setFillStyle("#666666");
  context.setFontSize(20);
  context.fillText(item?.skuName?.slice(0, 22) || "微信扫码帮好友付款", 50, 548, 500);
  context.setFillStyle("#2d5a3d");
  context.setFontSize(40);
  context.fillText(formatPrice(preview.value?.payAmount ?? 0, true), 50, 616);
  context.drawImage(codePath, 374, 604, 150, 150);
  context.setFillStyle("#666666");
  context.setFontSize(20);
  context.fillText("长按识别小程序码完成代付", 50, 724);
  context.setFillStyle("#999999");
  context.setFontSize(17);
  context.fillText("金额与状态以小程序内实时信息为准", 50, 760);

  return new Promise((resolve) => context.draw(false, resolve));
}

function exportPoster(): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.canvasToTempFilePath({
      canvasId: CANVAS_ID,
      width: 600,
      height: 840,
      destWidth: 1200,
      destHeight: 1680,
      fileType: "png",
      success: ({ tempFilePath }) => resolve(tempFilePath),
      fail: reject,
    });
  });
}

async function generatePoster(): Promise<void> {
  if (!preview.value || !token.value || posterLoading.value) return;
  posterLoading.value = true;
  try {
    const codeSource = await posterCodePath(await ProxyPayAPI.getPosterCode(token.value));
    const [productPath, codePath] = await Promise.all([
      imagePath(preview.value.items[0]?.productImage),
      imagePath(codeSource),
    ]);
    if (!codePath) throw new Error("小程序码加载失败");
    await drawPoster(productPath, codePath);
    const posterPath = await exportPoster();
    await uni.previewImage({ urls: [posterPath], current: posterPath });
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : "海报生成失败，请稍后重试",
      icon: "none",
    });
  } finally {
    posterLoading.value = false;
  }
}

async function handleAppointmentSuccess(): Promise<void> {
  const { confirm } = await uni.showModal({
    title: "预约成功",
    content: "已为你保留到店时间。",
    cancelText: "留在当前页",
    confirmText: "查看预约",
  });
  if (confirm) {
    navigate(RoutePath.APPOINTMENT, { params: { tab: AppointmentTab.PENDING_ARRIVAL } });
  }
}

function viewOrder(): void {
  if (orderId.value) navigate(RoutePath.ORDER_DETAIL, { params: { id: orderId.value } });
}

function finish(): void {
  goBack();
}

function goHome(): void {
  navigate(RoutePath.HOME);
}

onShareAppMessage(() => ({
  title: preview.value ? `请帮我支付 ${formatPrice(preview.value.payAmount, true)}` : "好友代付",
  path: token.value ? sharePath() : undefined,
  imageUrl: preview.value?.items[0]?.productImage || undefined,
}));

onLoad((options) => {
  orderId.value = options?.orderId ? String(options.orderId) : "";
  token.value = options?.token
    ? String(options.token)
    : options?.scene
      ? String(options.scene)
      : "";
  clockTimer = setInterval(() => {
    now.value = Date.now();
  }, 1000);
  void loadPage();
});

onShow(() => {
  pageVisible.value = true;
  if (preview.value && !terminal.value) {
    void loadStatus();
    startPolling();
  }
});

onHide(() => {
  pageVisible.value = false;
  stopPolling();
});

onUnload(() => {
  stopPolling();
  if (clockTimer) clearInterval(clockTimer);
});

onPullDownRefresh(async () => {
  if (preview.value) await loadStatus();
  else await loadPage();
  uni.stopPullDownRefresh();
});
</script>

<style lang="scss" scoped>
.proxy-state {
  display: flex;
  gap: $spacing-sm;
  align-items: center;
  justify-content: center;
  min-height: 720rpx;
  color: $color-text-sub;
}

.proxy-content {
  min-height: 100vh;
  padding: $spacing-md $page-padding 48rpx;
  background: $color-bg-page;
}

.proxy-hero {
  padding: 44rpx $spacing-lg;
  color: $color-bg;
  text-align: center;
  background: linear-gradient(145deg, $color-primary-dark, $color-primary-light);
  border-radius: $radius-card;

  &--success {
    background: linear-gradient(145deg, #275c3b, #60a274);
  }

  &--muted {
    background: linear-gradient(145deg, #6f7471, #a6aaa8);
  }

  &--paying {
    background: linear-gradient(145deg, #6e4d25, #ba8950);
  }
}

.proxy-hero__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 104rpx;
  height: 104rpx;
  margin: 0 auto;
  font-size: 48rpx;
  font-weight: 700;
  color: $color-primary-dark;
  background: rgb(255 255 255 / 92%);
  border-radius: 50%;
}

.proxy-hero__title {
  margin-top: $spacing-md;
  font-size: $font-size-xl;
  font-weight: 700;
}

.proxy-hero__hint,
.proxy-hero__countdown {
  margin-top: $spacing-xs;
  font-size: $font-size-sm;
  color: rgb(255 255 255 / 82%);
}

.proxy-hero__countdown {
  display: inline-flex;
  padding: 6rpx 18rpx;
  margin-top: $spacing-md;
  background: rgb(255 255 255 / 14%);
  border-radius: $radius-tag;
}

.proxy-card {
  padding: $spacing-lg;
  margin-top: $spacing-md;
  background: $color-bg;
  border-radius: $radius-card;
}

.proxy-card__head {
  display: flex;
  gap: $spacing-md;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: $spacing-md;
  border-bottom: 1rpx solid $color-line;
}

.proxy-card__eyebrow {
  font-size: $font-size-xs;
  color: $color-primary;
}

.proxy-card__title {
  margin-top: 4rpx;
  font-size: $font-size-lg;
  font-weight: 700;
  color: $color-text-title;
}

.proxy-card__status {
  flex-shrink: 0;
  padding: 6rpx 14rpx;
  font-size: $font-size-xs;
  color: $color-primary;
  background: $color-primary-tint;
  border-radius: $radius-tag;
}

.proxy-item {
  display: flex;
  gap: $spacing-md;
  padding: $spacing-md 0;
  border-bottom: 1rpx solid $color-line;
}

.proxy-item__image {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 132rpx;
  height: 132rpx;
  background: $color-bg-page;
  border-radius: $radius-input;

  &--empty {
    font-size: $font-size-sm;
    color: $color-primary;
  }
}

.proxy-item__content {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.proxy-item__name {
  font-size: $font-size-md;
  font-weight: 600;
  color: $color-text-title;

  @include ellipsis-multi(2);
}

.proxy-item__sku,
.proxy-item__quantity {
  margin-top: $spacing-xs;
  font-size: $font-size-sm;
  color: $color-text-placeholder;
}

.proxy-item__quantity {
  margin-top: auto;
}

.proxy-total {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  padding-top: $spacing-md;
  font-size: $font-size-sm;
  color: $color-text-sub;
}

.proxy-total__amount {
  margin-left: $spacing-sm;
  font-size: 40rpx;
  font-weight: 700;
  color: $color-price;
}

.proxy-privacy {
  display: flex;
  gap: $spacing-sm;
  align-items: flex-start;
  padding: $spacing-md;
  margin-top: $spacing-md;
  font-size: $font-size-xs;
  line-height: 1.6;
  color: $color-text-sub;
  background: $color-primary-tint;
  border-radius: $radius-input;
}

.proxy-privacy__mark {
  display: flex;
  flex: 0 0 32rpx;
  align-items: center;
  justify-content: center;
  width: 32rpx;
  height: 32rpx;
  font-size: 20rpx;
  font-weight: 700;
  color: $color-bg;
  background: $color-primary;
  border-radius: 50%;
}

.proxy-refresh-error {
  margin-top: $spacing-md;
  font-size: $font-size-xs;
  color: $color-warning;
  text-align: center;
}

.proxy-actions {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.proxy-actions__hint {
  font-size: $font-size-xs;
  color: $color-text-placeholder;
  text-align: center;
}

.proxy-share-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: $height-button;
  padding: 0 $spacing-lg;
  margin: 0;
  font-size: $font-size-md;
  font-weight: 600;
  line-height: $height-button;
  color: $color-bg;
  background: $color-primary-dark;
  border: 0;
  border-radius: $radius-button;

  &::after {
    border: 0;
  }
}

.proxy-poster-canvas {
  position: fixed;
  top: 0;
  left: -2000px;
  width: 600px;
  height: 840px;
  pointer-events: none;
  opacity: 0;
}
</style>
