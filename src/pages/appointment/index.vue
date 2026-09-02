<template>
  <YjPage class="appointment-page" :tabbar="RoutePath.APPOINTMENT" :padded="false">
    <view class="appointment-tabs">
      <view
        v-for="tab in TABS"
        :key="tab.value"
        class="appointment-tab"
        :class="{ 'is-active': activeTab === tab.value }"
        @click="selectTab(tab.value)"
      >
        <text>{{ tab.label }}</text>
        <text v-if="tabCount(tab.value) !== undefined" class="appointment-tab__count">
          {{ tabCount(tab.value) }}
        </text>
      </view>
    </view>

    <view v-if="!loggedIn" class="appointment-login">
      <YjEmpty image="user" text="登录后查看我的预约">
        <view class="appointment-login__button" @click="goLogin">立即登录</view>
      </YjEmpty>
    </view>

    <view v-else class="appointment-list">
      <view
        v-if="currentState.loading && currentState.list.length === 0"
        class="appointment-loading"
      >
        <wd-loading size="48rpx" />
      </view>

      <YjEmpty
        v-else-if="currentState.error && currentState.list.length === 0"
        image="network"
        :text="currentState.error"
      >
        <view class="appointment-list__retry" @click="fetchList(activeTab, true)">重新加载</view>
      </YjEmpty>

      <YjEmpty
        v-else-if="currentState.loaded && currentState.list.length === 0"
        :text="emptyText"
      />

      <template v-else>
        <view
          v-for="item in currentState.list"
          :key="item.appointmentId || item.id || item.orderId || item.orderNo || ''"
          class="appointment-card"
        >
          <view class="appointment-card__header">
            <view class="appointment-card__scene">
              {{ item.sceneType === "ORDER" ? "订单预约" : "面诊预约" }}
            </view>
            <view class="appointment-card__status">{{ activeTabLabel }}</view>
          </view>

          <view v-if="item.productNames.length" class="appointment-card__products">
            {{ item.productNames.join("、") }}
          </view>
          <view v-if="item.orderNo" class="appointment-card__row">
            <text>订单号</text>
            <text>{{ item.orderNo }}</text>
          </view>

          <view
            v-if="activeTab === AppointmentTab.PENDING_BOOKING"
            class="appointment-card__notice"
          >
            订单已支付，请选择预约到店时间
          </view>
          <template v-else>
            <view class="appointment-card__row appointment-card__row--strong">
              <text>{{ activeTab === AppointmentTab.CANCELLED ? "原预约时间" : "预约时间" }}</text>
              <text>{{ item.appointmentDate }} {{ item.appointmentTime }}</text>
            </view>
            <view v-if="item.completeTime" class="appointment-card__row">
              <text>完成时间</text>
              <text>{{ formatDate(item.completeTime) }}</text>
            </view>
            <view v-if="item.cancelTime" class="appointment-card__row">
              <text>取消时间</text>
              <text>{{ formatDate(item.cancelTime) }}</text>
            </view>
            <view v-if="item.cancelReason" class="appointment-card__reason">
              取消原因：{{ item.cancelReason }}
            </view>
          </template>

          <view v-if="hasActions(item)" class="appointment-card__actions">
            <view
              v-if="item.orderId"
              class="appointment-card__button"
              @click="viewOrder(item.orderId)"
            >
              查看订单
            </view>
            <view v-if="item.canCancel" class="appointment-card__button" @click="openCancel(item)">
              取消预约
            </view>
            <view
              v-if="item.canReschedule"
              class="appointment-card__button"
              @click="openReschedule(item)"
            >
              改期
            </view>
            <view
              v-if="item.canBook"
              class="appointment-card__button appointment-card__button--primary"
              @click="openBooking(item)"
            >
              去预约
            </view>
          </view>
        </view>

        <view v-if="currentState.loading" class="appointment-list__more">加载中...</view>
        <view
          v-else-if="currentState.error"
          class="appointment-list__more appointment-list__more--retry"
          @click="fetchList(activeTab)"
        >
          加载失败，点击重试
        </view>
        <view
          v-else-if="currentState.loaded && currentState.list.length >= currentState.total"
          class="appointment-list__more"
        >
          没有更多了
        </view>
      </template>
    </view>

    <YjAppointmentDrawer
      v-model:visible="drawerVisible"
      :mode="drawerMode"
      :order-id="drawerItem?.orderId || ''"
      :appointment-id="drawerItem?.appointmentId || drawerItem?.id || ''"
      :original-date="drawerItem?.appointmentDate || ''"
      :original-time="drawerItem?.appointmentTime || ''"
      @success="handleDrawerSuccess"
    />

    <wd-popup
      v-model="cancelPopupVisible"
      position="bottom"
      root-portal
      safe-area-inset-bottom
      :z-index="1100"
      :close-on-click-modal="!cancelSubmitting"
      custom-style="border-radius: 28rpx 28rpx 0 0; overflow: hidden;"
    >
      <view class="cancel-popup">
        <view class="cancel-popup__header">
          <text>取消预约</text>
          <wd-icon name="close" size="42rpx" @click="closeCancel" />
        </view>
        <view class="cancel-popup__tip">{{ cancelTip }}</view>
        <view class="cancel-popup__reasons">
          <view
            v-for="reason in CANCEL_REASONS"
            :key="reason"
            class="cancel-popup__reason"
            :class="{ 'is-active': cancelReason === reason }"
            @click="cancelReason = cancelReason === reason ? '' : reason"
          >
            {{ reason }}
          </view>
        </view>
        <textarea
          v-model="cancelRemark"
          class="cancel-popup__textarea"
          :maxlength="120"
          placeholder="其他说明（选填）"
        />
        <view class="cancel-popup__actions">
          <wd-button block plain :disabled="cancelSubmitting" @click="closeCancel"
            >暂不取消</wd-button
          >
          <wd-button block type="primary" :loading="cancelSubmitting" @click="confirmCancel">
            确认取消
          </wd-button>
        </view>
      </view>
    </wd-popup>
  </YjPage>
</template>

<script setup lang="ts">
import AppointmentAPI, {
  AppointmentTab,
  isAppointmentTab,
  type AppointmentListItem,
  type AppointmentSummary,
} from "@/api/appointment";
import type { AppointmentDrawerMode } from "@/components/YjAppointmentDrawer.vue";
import { RoutePath } from "@/constants";
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/format";
import { consumeTabBarParams, navigate } from "@/utils/navigate";

interface ListState {
  list: AppointmentListItem[];
  total: number;
  pageNum: number;
  loading: boolean;
  loaded: boolean;
  error: string;
  sequence: number;
}

const PAGE_SIZE = 10;
const CANCEL_REASONS = ["行程有变", "时间冲突", "暂时不需要"];
const TABS = [
  { value: AppointmentTab.PENDING_BOOKING, label: "待预约" },
  { value: AppointmentTab.PENDING_ARRIVAL, label: "待到店" },
  { value: AppointmentTab.SERVICE_RECORD, label: "服务记录" },
  { value: AppointmentTab.CANCELLED, label: "已取消" },
] as const;

const userStore = useUserStore();

function createListState(): ListState {
  return { list: [], total: 0, pageNum: 1, loading: false, loaded: false, error: "", sequence: 0 };
}

const activeTab = ref<AppointmentTab>(AppointmentTab.PENDING_ARRIVAL);
const summary = ref<AppointmentSummary | null>(null);
const listStates = reactive<Record<AppointmentTab, ListState>>({
  [AppointmentTab.PENDING_BOOKING]: createListState(),
  [AppointmentTab.PENDING_ARRIVAL]: createListState(),
  [AppointmentTab.SERVICE_RECORD]: createListState(),
  [AppointmentTab.CANCELLED]: createListState(),
});
const drawerVisible = ref(false);
const drawerMode = ref<AppointmentDrawerMode>("create");
const drawerItem = ref<AppointmentListItem | null>(null);
const cancelPopupVisible = ref(false);
const cancelTarget = ref<AppointmentListItem | null>(null);
const cancelReason = ref("");
const cancelRemark = ref("");
const cancelSubmitting = ref(false);

const loggedIn = computed(() => userStore.isLoggedIn);
const cancelTip = computed(() =>
  cancelTarget.value?.sceneType === "ORDER"
    ? "取消后会释放该时段，订单仍可重新预约。"
    : "取消后会释放该预约时段。"
);
const currentState = computed(() => listStates[activeTab.value]);
const activeTabLabel = computed(
  () => TABS.find((tab) => tab.value === activeTab.value)?.label || ""
);
const emptyText = computed(() => {
  if (activeTab.value === AppointmentTab.PENDING_BOOKING) return "暂无待预约订单";
  if (activeTab.value === AppointmentTab.PENDING_ARRIVAL) return "暂无待到店预约";
  if (activeTab.value === AppointmentTab.SERVICE_RECORD) return "暂无已完成服务";
  return "暂无已取消预约";
});

function tabCount(tab: AppointmentTab): number | undefined {
  if (!summary.value) return undefined;
  if (tab === AppointmentTab.PENDING_BOOKING) return summary.value.pendingBooking;
  if (tab === AppointmentTab.PENDING_ARRIVAL) return summary.value.pendingArrival;
  if (tab === AppointmentTab.SERVICE_RECORD) return summary.value.serviceRecord;
  return undefined;
}

function selectTab(tab: AppointmentTab): void {
  if (activeTab.value === tab) return;
  activeTab.value = tab;
  if (!listStates[tab].loaded) void fetchList(tab, true);
}

async function fetchSummary(): Promise<void> {
  try {
    summary.value = await AppointmentAPI.getSummary();
  } catch {
    summary.value = null;
  }
}

async function fetchList(tab: AppointmentTab, reset = false): Promise<void> {
  const state = listStates[tab];
  if (!reset && (state.loading || (state.loaded && state.list.length >= state.total))) return;

  if (reset) {
    state.sequence += 1;
    state.pageNum = 1;
    state.list = [];
    state.total = 0;
    state.loaded = false;
    state.error = "";
  }
  const sequence = state.sequence;
  const pageNum = state.pageNum;
  state.error = "";
  state.loading = true;
  try {
    const result = await AppointmentAPI.getPage({ tab, pageNum, pageSize: PAGE_SIZE });
    if (sequence !== state.sequence) return;
    state.list = [...state.list, ...(result.list ?? [])];
    state.total = result.total ?? 0;
    state.pageNum = pageNum + 1;
    state.loaded = true;
  } catch (error) {
    if (sequence !== state.sequence) return;
    state.error = error instanceof Error ? error.message : "预约记录加载失败";
    state.loaded = true;
  } finally {
    if (sequence === state.sequence) state.loading = false;
  }
}

async function refreshCurrent(): Promise<void> {
  if (!loggedIn.value) return;
  await Promise.all([fetchSummary(), fetchList(activeTab.value, true)]);
}

function goLogin(): void {
  navigate(RoutePath.APPOINTMENT, {
    requireAuth: true,
    params: { tab: activeTab.value },
  });
}

function viewOrder(orderId: string | null): void {
  if (!orderId) return;
  navigate(RoutePath.ORDER_DETAIL, { requireAuth: true, params: { id: orderId } });
}

function hasActions(item: AppointmentListItem): boolean {
  return Boolean(item.orderId || item.canBook || item.canCancel || item.canReschedule);
}

function openBooking(item: AppointmentListItem): void {
  if (!item.canBook || !item.orderId) return;
  drawerMode.value = "create";
  drawerItem.value = item;
  drawerVisible.value = true;
}

function openReschedule(item: AppointmentListItem): void {
  if (!item.canReschedule || !(item.appointmentId || item.id)) return;
  drawerMode.value = "reschedule";
  drawerItem.value = item;
  drawerVisible.value = true;
}

async function handleDrawerSuccess(mode: AppointmentDrawerMode): Promise<void> {
  uni.showToast({ title: mode === "reschedule" ? "改期成功" : "预约成功", icon: "success" });
  for (const state of Object.values(listStates)) state.loaded = false;
  activeTab.value = AppointmentTab.PENDING_ARRIVAL;
  await refreshCurrent();
}

function openCancel(item: AppointmentListItem): void {
  if (!item.canCancel || !(item.appointmentId || item.id)) return;
  cancelTarget.value = item;
  cancelReason.value = "";
  cancelRemark.value = "";
  cancelPopupVisible.value = true;
}

function closeCancel(): void {
  if (!cancelSubmitting.value) cancelPopupVisible.value = false;
}

async function confirmCancel(): Promise<void> {
  const id = cancelTarget.value?.appointmentId || cancelTarget.value?.id;
  if (!id || cancelSubmitting.value) return;
  const reason = [
    cancelReason.value,
    cancelRemark.value.trim() && `备注：${cancelRemark.value.trim()}`,
  ]
    .filter(Boolean)
    .join("；");
  cancelSubmitting.value = true;
  try {
    await AppointmentAPI.cancel(id, { reason: reason || undefined });
    cancelPopupVisible.value = false;
    uni.showToast({ title: "已取消预约", icon: "success" });
    for (const state of Object.values(listStates)) state.loaded = false;
    await refreshCurrent();
  } finally {
    cancelSubmitting.value = false;
  }
}

onLoad((options) => {
  const tab = String(options?.tab ?? "");
  if (isAppointmentTab(tab)) activeTab.value = tab;
});

onShow(() => {
  const params = consumeTabBarParams(RoutePath.APPOINTMENT);
  if (isAppointmentTab(params?.tab)) activeTab.value = params.tab;
  void refreshCurrent();
});

onReachBottom(() => {
  if (loggedIn.value) void fetchList(activeTab.value);
});

onPullDownRefresh(async () => {
  await refreshCurrent();
  uni.stopPullDownRefresh();
});
</script>

<style lang="scss" scoped>
.appointment-page {
  min-height: 100vh;

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(.page__body) {
    background: $color-bg-page;
  }
}

.appointment-tabs {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  height: 92rpx;
  background: $color-bg;
  border-bottom: 2rpx solid $color-line;
}

.appointment-tab {
  position: relative;
  display: flex;
  flex: 1;
  gap: 4rpx;
  align-items: center;
  justify-content: center;
  font-size: $font-size-sm;
  color: $color-text-sub;

  &::after {
    position: absolute;
    right: 28%;
    bottom: 0;
    left: 28%;
    height: 4rpx;
    content: "";
    background: transparent;
  }

  &.is-active {
    font-weight: 600;
    color: $color-primary-dark;

    &::after {
      background: $color-primary-dark;
    }
  }

  &__count {
    min-width: 30rpx;
    height: 30rpx;
    padding: 0 7rpx;
    font-size: 20rpx;
    line-height: 30rpx;
    color: $color-primary;
    text-align: center;
    background: $color-primary-tint;
    border-radius: 16rpx;
  }
}

.appointment-login,
.appointment-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 480rpx;
}

.appointment-login__button,
.appointment-list__retry {
  padding: $spacing-sm $spacing-lg;
  margin-top: $spacing-md;
  font-size: $font-size-sm;
  color: $color-primary;
  border: 2rpx solid $color-primary;
  border-radius: $radius-button;
}

.appointment-list {
  padding: $spacing-md $page-padding;
}

.appointment-card {
  padding: $spacing-md;
  margin-bottom: $spacing-md;
  background: $color-bg;
  border-radius: $radius-card;
  box-shadow: 0 8rpx 26rpx rgba($color-primary-dark, 0.05);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: $spacing-sm;
    border-bottom: 2rpx solid $color-line;
  }

  &__scene {
    font-size: $font-size-md;
    font-weight: 600;
    color: $color-text-title;
  }

  &__status {
    padding: 5rpx 14rpx;
    font-size: $font-size-xs;
    color: $color-primary;
    background: $color-primary-tint;
    border-radius: $radius-tag;
  }

  &__products {
    padding: $spacing-md 0;
    font-size: $font-size-md;
    font-weight: 500;
    line-height: 1.55;
    color: $color-text-title;
  }

  &__row {
    display: flex;
    gap: $spacing-md;
    justify-content: space-between;
    padding-top: $spacing-sm;
    font-size: $font-size-sm;
    line-height: 1.5;
    color: $color-text-sub;

    text:last-child {
      color: $color-text-content;
      text-align: right;
      word-break: break-all;
    }

    &--strong text:last-child {
      font-weight: 600;
      color: $color-primary-dark;
    }
  }

  &__notice,
  &__reason {
    padding: $spacing-sm;
    margin-top: $spacing-md;
    font-size: $font-size-sm;
    line-height: 1.6;
    color: $color-text-sub;
    background: $color-bg-page;
    border-radius: $radius-input;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
    justify-content: flex-end;
    padding-top: $spacing-md;
    margin-top: $spacing-md;
    border-top: 2rpx solid $color-line;
  }

  &__button {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 140rpx;
    height: 64rpx;
    padding: 0 $spacing-md;
    font-size: $font-size-sm;
    color: $color-text-content;
    border: 2rpx solid $color-border;
    border-radius: 32rpx;

    &--primary {
      color: $color-bg;
      background: $color-primary-dark;
      border-color: $color-primary-dark;
    }
  }
}

.appointment-list__more {
  padding: $spacing-sm 0 $spacing-md;
  font-size: $font-size-sm;
  color: $color-text-placeholder;
  text-align: center;

  &--retry {
    color: $color-primary;
  }
}

.cancel-popup {
  padding: $spacing-lg $page-padding $spacing-md;
  background: $color-bg;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: $font-size-lg;
    font-weight: 700;
    color: $color-text-title;
  }

  &__tip {
    margin-top: $spacing-sm;
    font-size: $font-size-sm;
    line-height: 1.6;
    color: $color-text-sub;
  }

  &__reasons {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
    margin-top: $spacing-md;
  }

  &__reason {
    padding: 12rpx $spacing-md;
    font-size: $font-size-sm;
    color: $color-text-sub;
    background: $color-bg-page;
    border: 2rpx solid transparent;
    border-radius: $radius-tag;

    &.is-active {
      color: $color-primary;
      background: $color-primary-tint;
      border-color: $color-primary;
    }
  }

  &__textarea {
    width: 100%;
    height: 150rpx;
    padding: $spacing-sm;
    margin-top: $spacing-md;
    font-size: $font-size-sm;
    color: $color-text-content;
    background: $color-bg-page;
    border-radius: $radius-input;
  }

  &__actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $spacing-sm;
    margin-top: $spacing-md;
  }
}
</style>
