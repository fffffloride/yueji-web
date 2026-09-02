<template>
  <YjPage :tabbar="RoutePath.MINE" :padded="false">
    <view class="mine-page">
      <YjMineMemberCard
        :member="mineMember"
        :account="memberAccount"
        :nickname="userStore.userInfo.nickname"
        :logged-in="userStore.isLoggedIn"
        @more="handleComingSoon"
        @scan="handleComingSoon"
        @login="handleEntryClick(RoutePath.USER_MEMBER)"
        @member="handleEntryClick(RoutePath.USER_MEMBER)"
        @unlock="handleEntryClick(RoutePath.USER_MEMBER)"
        @stat="handleStatClick"
      />

      <!-- 快捷工具 -->
      <view class="mine-section">
        <YjQuickEntry :items="mineQuickTools" @click="handleQuickTool" />
      </view>

      <!-- 服务入口 -->
      <view class="mine-section">
        <YjMineServiceGrid :items="mineServices" @select="handleServiceSelect" />
      </view>

      <!-- 退出登录：未登录不展示 -->
      <view v-if="userStore.isLoggedIn" class="mine-section">
        <view class="mine-logout__button" @click="handleLogout">退出登录</view>
      </view>

      <wd-message-box />
    </view>

    <movable-area
      class="mine-consult-area"
      @touchstart="handleConsultTouchStart"
      @touchend="handleConsultTouchEnd"
    >
      <movable-view
        class="mine-consult-float"
        direction="all"
        :x="consultX"
        :y="consultY"
        :animation="true"
        @change="handleConsultMove"
        @click="handleConsultClick"
      >
        <view class="mine-consult-button" role="button" aria-label="咨询预约">
          <wd-icon name="chat" size="28rpx" />
          <text>咨询/预约</text>
        </view>
      </movable-view>
    </movable-area>
  </YjPage>
</template>

<script setup lang="ts">
import { useMessage } from "wot-design-uni";
import MarketingAPI, { type PointsAccount } from "@/api/marketing";
import { RoutePath } from "@/constants";
import { mineMember, mineQuickTools, mineServices } from "@/mocks/mine";
import { useUserStore } from "@/stores/user";
import { snapToHorizontalEdge } from "@/utils/floating-action";
import { navigate } from "@/utils/navigate";

interface ElementRect {
  height?: number;
  width?: number;
}

interface MovableChangeEvent {
  detail: { source: string; x: number; y: number };
}

const CONSULT_INITIAL_POSITION = 10_000;
const CONSULT_EDGE_RPX = 24;
const CONSULT_SNAP_DELAY_MS = 320;
const DRAG_THRESHOLD_PX = 4;

const userStore = useUserStore();
const message = useMessage();
const instance = getCurrentInstance();
const memberAccount = ref<PointsAccount | null>(null);
const consultX = ref(CONSULT_INITIAL_POSITION);
const consultY = ref(CONSULT_INITIAL_POSITION);

let consultMaxX = 0;
let consultMaxY = 0;
let consultMargin = 0;
let currentConsultX = 0;
let currentConsultY = 0;
let touchStartX = 0;
let touchStartY = 0;
let hasDragged = false;
let suppressNextClick = false;
let suppressTimer: ReturnType<typeof setTimeout> | undefined;
let snapTimer: ReturnType<typeof setTimeout> | undefined;
let consultMeasured = false;

/** 快捷工具对应路由，顺序与 mineQuickTools 一致。 */
const QUICK_TOOL_ROUTES = [
  RoutePath.ORDER_LIST,
  RoutePath.USER_COUPON,
  RoutePath.USER_WALLET,
  RoutePath.USER_POINTS,
];

/** 服务入口对应路由，顺序与 mineServices 一致。 */
const SERVICE_ROUTES: { path: string; requireAuth: boolean }[] = [
  { path: RoutePath.USER_MEDICAL_RECORD, requireAuth: true },
  { path: RoutePath.USER_COMMUNITY, requireAuth: true },
  { path: RoutePath.USER_VERIFY_GIFT, requireAuth: true },
  { path: RoutePath.BRAND, requireAuth: false },
  { path: RoutePath.USER_SETTINGS, requireAuth: true },
];

/** 未登录时点击需要登录的入口先走登录流程。 */
function handleEntryClick(path: string, requireAuth = true) {
  navigate(path, { requireAuth });
}

function handleConsult() {
  navigate(RoutePath.APPOINTMENT);
}

function resetConsultPosition() {
  if (!consultMeasured) return;
  consultX.value = Math.max(0, consultMaxX - consultMargin);
  consultY.value = Math.max(0, consultMaxY - consultMargin);
}

function snapConsultPosition() {
  if (!consultMeasured) return;
  consultX.value = snapToHorizontalEdge(currentConsultX, consultMaxX, consultMargin);
  consultY.value = Math.min(consultMaxY, Math.max(0, currentConsultY));
}

function measureConsultBounds() {
  const query = uni.createSelectorQuery();
  if (instance?.proxy) query.in(instance.proxy);
  query.select(".mine-consult-area").boundingClientRect();
  query.select(".mine-consult-float").boundingClientRect();
  query.exec((results) => {
    const area = results[0] as ElementRect | undefined;
    const button = results[1] as ElementRect | undefined;
    if (!area?.width || !area.height || !button?.width || !button.height) return;

    consultMaxX = Math.max(0, area.width - button.width);
    consultMaxY = Math.max(0, area.height - button.height);
    consultMargin = uni.upx2px(CONSULT_EDGE_RPX);
    consultMeasured = true;
    resetConsultPosition();
  });
}

function handleConsultMove(event: MovableChangeEvent) {
  const { x, y, source } = event.detail;
  currentConsultX = x;
  currentConsultY = y;
  if (source.startsWith("touch") && !hasDragged) {
    hasDragged = Math.hypot(x - touchStartX, y - touchStartY) > DRAG_THRESHOLD_PX;
  }
  if (source.startsWith("touch")) {
    if (snapTimer) clearTimeout(snapTimer);
    // ponytail: H5 可能不透传结束事件，用短暂停止兜底；平台提供 dragend 后可替换。
    snapTimer = setTimeout(snapConsultPosition, CONSULT_SNAP_DELAY_MS);
  }
}

function handleConsultTouchStart() {
  if (suppressTimer) clearTimeout(suppressTimer);
  if (snapTimer) clearTimeout(snapTimer);
  touchStartX = currentConsultX;
  touchStartY = currentConsultY;
  hasDragged = false;
  suppressNextClick = false;
}

function handleConsultTouchEnd() {
  if (snapTimer) clearTimeout(snapTimer);
  snapConsultPosition();
  if (!hasDragged) return;

  hasDragged = false;
  suppressNextClick = true;
  suppressTimer = setTimeout(() => {
    suppressNextClick = false;
  }, 250);
}

function handleConsultClick() {
  if (suppressNextClick) {
    suppressNextClick = false;
    return;
  }
  handleConsult();
}

/** 统计项：仅「待预约」进入现有预约页，其余照设计稿无动作。 */
function handleStatClick(index: number) {
  if (index === 0) handleEntryClick(RoutePath.APPOINTMENT);
}

function handleQuickTool(index: number) {
  const path = QUICK_TOOL_ROUTES[index];
  if (path) handleEntryClick(path);
}

function handleServiceSelect(index: number) {
  const route = SERVICE_ROUTES[index];
  if (route) handleEntryClick(route.path, route.requireAuth);
}

function handleComingSoon() {
  uni.showToast({ title: "敬请期待", icon: "none" });
}

async function loadMemberAccount() {
  if (!userStore.isLoggedIn) {
    memberAccount.value = null;
    return;
  }
  try {
    memberAccount.value = await MarketingAPI.getPointsAccount();
  } catch {
    memberAccount.value = null;
  }
}

/** 退出登录：二次确认后清空登录态。 */
async function handleLogout() {
  const result = await message.confirm({
    title: "退出登录",
    msg: "确定要退出当前账号吗？",
    confirmButtonText: "退出",
    cancelButtonText: "取消",
    // wd-message-box 默认 z-index 99，低于自定义 TabBar 的 500，需显式抬高
    zIndex: 600,
  });
  if (result.action === "confirm") {
    userStore.logout();
    uni.showToast({ title: "已退出登录", icon: "none" });
  }
}

onShow(() => {
  void loadMemberAccount();
  resetConsultPosition();
});

onReady(() => {
  nextTick(() => setTimeout(measureConsultBounds, 50));
});
</script>

<style lang="scss" scoped>
.mine-page {
  min-height: calc(100vh - #{$height-tabbar});
  padding-bottom: $spacing-lg;
  background:
    radial-gradient(circle at 92% 6%, rgba($color-primary-lighter, 0.12), transparent 30%),
    linear-gradient(180deg, #eef4f0 0%, $color-bg-page 46%, $color-bg-page 100%);
}

.mine-section {
  margin: $spacing-md 24rpx 0;

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(.card) {
    background: rgba($color-bg, 0.94);
    border: 2rpx solid rgba($color-bg, 0.92);
    box-shadow: 0 12rpx 34rpx rgba($color-primary-dark, 0.06);
  }
}

.mine-logout__button {
  padding: 28rpx 0;
  font-size: $font-size-md;
  color: $color-text-content;
  text-align: center;
  background: rgba($color-bg, 0.9);
  border: 2rpx solid rgba($color-primary-dark, 0.08);
  border-radius: $radius-card;
  box-shadow: 0 12rpx 34rpx rgba($color-primary-dark, 0.04);
}

.mine-consult-area {
  position: fixed;
  inset: var(--window-top, 0) 0 $height-tabbar;
  z-index: 450;
  display: block;
  width: auto;
  height: auto;
  pointer-events: none;
}

.mine-consult-float {
  display: block;
  width: 192rpx;
  height: 80rpx;
  overflow: visible;
  pointer-events: auto;
}

.mine-consult-button {
  display: flex;
  gap: $spacing-xs;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: $font-size-sm;
  font-weight: 600;
  color: $color-bg;
  background: linear-gradient(135deg, $color-primary-light, $color-primary-dark);
  border: 2rpx solid rgba($color-bg, 0.22);
  border-radius: $radius-button;
  box-shadow: 0 14rpx 34rpx rgba($color-primary-dark, 0.28);
}
</style>
