<template>
  <YjPage :padded="false">
    <view class="order-list">
      <view class="order-list__tabs">
        <view
          v-for="tab in ORDER_STATUS_TABS"
          :key="tab.label"
          class="order-list__tab"
          :class="{ 'is-active': activeStatus === tab.value }"
          @click="selectStatus(tab.value)"
        >
          {{ tab.label }}
        </view>
      </view>

      <view class="order-list__content">
        <view class="order-list__gift-entry" @click="openGiftRecords">
          <text>赠礼记录</text>
          <wd-icon name="chevron-right" size="30rpx" />
        </view>

        <view v-if="loading && orders.length === 0" class="order-list__loading">
          <wd-loading size="48rpx" />
        </view>

        <YjEmpty v-else-if="loadError && orders.length === 0" image="network" :text="loadError">
          <view class="order-list__retry" @click="fetchOrders(true)">重新加载</view>
        </YjEmpty>

        <YjEmpty v-else-if="orders.length === 0" text="暂无相关订单" />

        <template v-else>
          <YjOrderCard
            v-for="order in orders"
            :key="order.id"
            :order="order"
            :action-loading="actionOrderId === order.id"
            @cancel="cancelOrder"
            @appointment="makeAppointment"
            @detail="viewOrder"
            @gift="openGift"
            @pay="continuePayment"
            @proxy-pay="openProxyPay"
          />

          <view v-if="loading" class="order-list__more">加载中...</view>
          <view v-else-if="finished" class="order-list__more">没有更多了</view>
        </template>
      </view>
    </view>

    <YjAppointmentDrawer
      v-model:visible="appointmentDrawerVisible"
      :order-id="appointmentOrderId"
      @success="handleAppointmentSuccess"
    />
  </YjPage>
</template>

<script setup lang="ts">
import { AppointmentTab } from "@/api/appointment";
import OrderAPI, { type OrderListItem } from "@/api/order";
import PayAPI from "@/api/pay";
import { RoutePath } from "@/constants";
import { ORDER_STATUS_TABS, OrderStatusEnum } from "@/enums/order";
import { isLoggedIn } from "@/utils/auth";
import { navigate } from "@/utils/navigate";
import { invokeWechatPayment } from "@/utils/payment";

const PAGE_SIZE = 10;

const orders = ref<OrderListItem[]>([]);
const activeStatus = ref<OrderStatusEnum>();
const loading = ref(false);
const finished = ref(false);
const pageNum = ref(1);
const loadError = ref("");
const actionOrderId = ref("");
const appointmentDrawerVisible = ref(false);
const appointmentOrderId = ref("");

let requestSequence = 0;
let isFirstShow = true;

async function fetchOrders(reset = false): Promise<void> {
  if (!reset && (loading.value || finished.value)) return;

  const sequence = reset ? ++requestSequence : requestSequence;
  if (reset) {
    pageNum.value = 1;
    finished.value = false;
    loadError.value = "";
    orders.value = [];
  }

  loading.value = true;
  const requestedPage = pageNum.value;
  try {
    const result = await OrderAPI.getPage({
      pageNum: requestedPage,
      pageSize: PAGE_SIZE,
      status: activeStatus.value,
    });
    if (sequence !== requestSequence) return;

    orders.value = [...orders.value, ...result.list];
    finished.value = orders.value.length >= result.total;
    pageNum.value = requestedPage + 1;
  } catch (error) {
    if (sequence !== requestSequence) return;
    loadError.value = error instanceof Error ? error.message : "订单加载失败";
  } finally {
    if (sequence === requestSequence) loading.value = false;
  }
}

function selectStatus(status?: OrderStatusEnum): void {
  if (activeStatus.value === status) return;
  activeStatus.value = status;
  void fetchOrders(true);
}

function viewOrder(order: OrderListItem): void {
  navigate(RoutePath.ORDER_DETAIL, {
    requireAuth: true,
    params: { id: order.id },
  });
}

function makeAppointment(order: OrderListItem): void {
  if (!order.canBookAppointment) return;
  if (!isLoggedIn()) {
    navigate(RoutePath.ORDER_LIST, {
      requireAuth: true,
      params: { status: activeStatus.value, openAppointment: order.id },
    });
    return;
  }
  appointmentOrderId.value = order.id;
  appointmentDrawerVisible.value = true;
}

function openGift(order: OrderListItem): void {
  navigate(RoutePath.ORDER_GIFT, {
    requireAuth: true,
    params: order.canGift
      ? { orderId: order.id }
      : {
          direction: order.viewerRole === "BENEFICIARY" ? "RECEIVED" : "SENT",
        },
  });
}

function openGiftRecords(): void {
  navigate(RoutePath.ORDER_GIFT, { requireAuth: true });
}

function openProxyPay(order: OrderListItem): void {
  if (!order.canProxyPay) return;
  navigate(RoutePath.ORDER_PROXY_PAY, {
    requireAuth: true,
    params: { orderId: order.id },
  });
}

async function handleAppointmentSuccess(): Promise<void> {
  await fetchOrders(true);
  const { confirm } = await uni.showModal({
    title: "预约成功",
    content: "已为你保留到店时间。",
    cancelText: "留在订单",
    confirmText: "查看预约",
  });
  if (confirm) {
    navigate(RoutePath.APPOINTMENT, { params: { tab: AppointmentTab.PENDING_ARRIVAL } });
  }
}

async function cancelOrder(order: OrderListItem): Promise<void> {
  if (actionOrderId.value) return;
  const { confirm } = await uni.showModal({
    title: "取消订单",
    content: "确定取消该订单吗？取消后库存和已锁定优惠将按服务端结果恢复。",
    confirmText: "确认取消",
  });
  if (!confirm) return;

  actionOrderId.value = order.id;
  try {
    await OrderAPI.cancel(order.id);
    await fetchOrders(true);
  } finally {
    actionOrderId.value = "";
  }
}

async function continuePayment(order: OrderListItem): Promise<void> {
  if (actionOrderId.value) return;
  actionOrderId.value = order.id;
  try {
    if (order.payAmount === 0) {
      navigate(RoutePath.ORDER_PAY_RESULT, {
        params: { orderId: order.id, orderNo: order.orderNo, success: 1 },
      });
      return;
    }

    const payment = await PayAPI.create(order.id);
    await invokeWechatPayment(payment);
    navigate(RoutePath.ORDER_PAY_RESULT, {
      params: { orderId: order.id, paymentNo: payment.paymentNo, orderNo: order.orderNo },
    });
  } finally {
    actionOrderId.value = "";
  }
}

onLoad((options) => {
  const status = Number(options?.status);
  if (options?.status !== undefined && ORDER_STATUS_TABS.some((tab) => tab.value === status)) {
    activeStatus.value = status as OrderStatusEnum;
  }
  void fetchOrders(true);
  if (options?.openAppointment && isLoggedIn()) {
    appointmentOrderId.value = String(options.openAppointment);
    appointmentDrawerVisible.value = true;
  }
});

onShow(() => {
  if (isFirstShow) {
    isFirstShow = false;
    return;
  }
  void fetchOrders(true);
});

onReachBottom(() => {
  void fetchOrders();
});

onPullDownRefresh(async () => {
  await fetchOrders(true);
  uni.stopPullDownRefresh();
});
</script>

<style lang="scss" scoped>
.order-list {
  min-height: 100vh;
}

.order-list__tabs {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  height: 88rpx;
  background: $color-bg;
  border-bottom: 2rpx solid $color-line;
}

.order-list__tab {
  position: relative;
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  font-size: $font-size-sm;
  color: $color-text-sub;

  &::after {
    position: absolute;
    right: 30%;
    bottom: 0;
    left: 30%;
    height: 4rpx;
    content: "";
    background: transparent;
    border-radius: 4rpx;
  }

  &.is-active {
    font-weight: 600;
    color: $color-text-title;

    &::after {
      background: $color-primary-dark;
    }
  }
}

.order-list__content {
  padding: $spacing-md $page-padding;
}

.order-list__gift-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
  font-size: $font-size-sm;
  color: $color-primary;
  background: $color-bg;
  border-radius: $radius-card;
}

.order-list__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320rpx;
}

.order-list__retry {
  padding: $spacing-sm $spacing-lg;
  margin-top: $spacing-md;
  font-size: $font-size-sm;
  color: $color-primary;
  border: 2rpx solid $color-primary;
  border-radius: $radius-button;
}

.order-list__more {
  padding: $spacing-sm 0 $spacing-md;
  font-size: $font-size-sm;
  color: $color-text-placeholder;
  text-align: center;
}
</style>
