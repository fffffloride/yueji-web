<template>
  <YjPage>
    <view class="pay-result">
      <view class="pay-result__hero">
        <view class="pay-result__icon" :class="`pay-result__icon--${state.tone}`">
          {{ state.symbol }}
        </view>
        <view class="pay-result__title">{{ state.title }}</view>
        <view class="pay-result__description">{{ state.description }}</view>
      </view>

      <view v-if="orderNo || payment" class="pay-result__card">
        <view v-if="orderNo" class="pay-result__row">
          <text>订单号</text>
          <text>{{ orderNo }}</text>
        </view>
        <view v-if="payment" class="pay-result__row">
          <text>{{ isFailed ? "应付金额" : "支付金额" }}</text>
          <text>{{ formatPrice(payment.amount, true) }}</text>
        </view>
        <view v-if="isSuccessful && payment?.paidTime" class="pay-result__row">
          <text>支付时间</text>
          <text>{{ formatDate(payment.paidTime) }}</text>
        </view>
        <view v-if="isFailed" class="pay-result__row">
          <text>支付状态</text>
          <text>支付失败</text>
        </view>
        <view v-else-if="isRefunded" class="pay-result__row">
          <text>支付状态</text>
          <text>已退款</text>
        </view>
      </view>

      <view v-if="queryError" class="pay-result__error">{{ queryError }}</view>

      <view class="pay-result__actions">
        <wd-button
          v-if="canMockPay"
          type="primary"
          block
          :loading="submitting"
          @click="confirmMock"
        >
          模拟支付
        </wd-button>
        <wd-button
          v-if="canRefresh"
          type="primary"
          plain
          block
          :loading="loading"
          @click="queryPayment"
        >
          刷新支付结果
        </wd-button>

        <wd-button v-if="isSuccessful && !groupId" type="primary" block @click="goAppointment">
          去预约
        </wd-button>
        <wd-button v-if="isSuccessful && groupId" type="primary" block @click="viewGroup">
          查看拼团进度
        </wd-button>
        <wd-button
          v-if="isSuccessful && resolvedOrderId"
          type="primary"
          plain
          block
          @click="viewOrder"
        >
          查看订单
        </wd-button>

        <wd-button
          v-if="(isFailed || isRefunded) && resolvedOrderId"
          type="info"
          block
          @click="viewOrder"
        >
          查看订单
        </wd-button>
        <wd-button
          v-if="!isSuccessful"
          :type="(isFailed || isRefunded) && !resolvedOrderId ? 'info' : 'primary'"
          plain
          block
          @click="goHome"
        >
          返回首页
        </wd-button>

        <button v-if="isSuccessful" class="pay-result__text-action" @click="goHome">
          返回首页
        </button>
        <wd-button v-if="isFailed" type="text" block open-type="contact">
          遇到问题？联系客服
        </wd-button>
      </view>
    </view>
  </YjPage>
</template>

<script setup lang="ts">
import PayAPI, { PaymentStatusEnum, type PaymentInfo } from "@/api/pay";
import { RoutePath } from "@/constants";
import { formatDate, formatPrice } from "@/utils/format";
import { navigate } from "@/utils/navigate";

const payment = ref<PaymentInfo>();
const paymentNo = ref("");
const orderId = ref("");
const orderNo = ref("");
const groupId = ref("");
const zeroAmountSuccess = ref(false);
const loading = ref(false);
const submitting = ref(false);
const queryError = ref("");

const isSuccessful = computed(
  () => zeroAmountSuccess.value || payment.value?.status === PaymentStatusEnum.SUCCESS
);
const isFailed = computed(() => payment.value?.status === PaymentStatusEnum.FAILED);
const isRefunded = computed(() => payment.value?.status === PaymentStatusEnum.REFUNDED);
const resolvedOrderId = computed(() => payment.value?.orderId || orderId.value);
const canRefresh = computed(
  () =>
    Boolean(paymentNo.value) &&
    (Boolean(queryError.value) || payment.value?.status === PaymentStatusEnum.PENDING)
);

const state = computed(() => {
  if (isSuccessful.value) {
    return {
      tone: "success",
      symbol: "✓",
      title: "支付成功",
      description: groupId.value
        ? "支付已完成，请先确认拼团进度，成团后再安排到店服务"
        : "项目已购买成功，选择合适时间，到店开启变美体验",
    };
  }
  if (isFailed.value) {
    return {
      tone: "error",
      symbol: "!",
      title: "支付失败",
      description: "本次支付未完成，订单仍为待付款，请在订单中查看后续状态",
    };
  }
  if (isRefunded.value) {
    return {
      tone: "default",
      symbol: "↶",
      title: "订单已退款",
      description: "退款状态以订单记录为准",
    };
  }
  return {
    tone: "pending",
    symbol: "…",
    title: queryError.value
      ? "暂时无法确认支付状态"
      : loading.value
        ? "正在查询支付结果"
        : "等待支付",
    description: queryError.value ? "请稍后刷新，以服务端最新结果为准" : "请完成支付后刷新结果",
  };
});

const canMockPay = computed(
  () => import.meta.env.DEV && payment.value?.status === PaymentStatusEnum.PENDING
);

async function queryPayment() {
  if (!paymentNo.value || loading.value) return;
  loading.value = true;
  queryError.value = "";
  try {
    payment.value = await PayAPI.get(paymentNo.value);
  } catch (error) {
    queryError.value = error instanceof Error ? error.message : "支付状态查询失败";
  } finally {
    loading.value = false;
  }
}

async function confirmMock() {
  if (!paymentNo.value || submitting.value) return;
  submitting.value = true;
  try {
    payment.value = await PayAPI.confirmMock(paymentNo.value);
    queryError.value = "";
  } finally {
    submitting.value = false;
  }
}

function viewGroup() {
  navigate(RoutePath.GROUP_BUY_DETAIL, {
    redirect: true,
    params: { groupId: groupId.value },
  });
}

function goAppointment() {
  navigate(RoutePath.APPOINTMENT);
}

function viewOrder() {
  if (!resolvedOrderId.value) return;
  navigate(RoutePath.ORDER_DETAIL, { params: { id: resolvedOrderId.value } });
}

function goHome() {
  navigate(RoutePath.HOME);
}

onLoad((options) => {
  paymentNo.value = options?.paymentNo ?? "";
  orderId.value = options?.orderId ?? "";
  orderNo.value = options?.orderNo ?? "";
  groupId.value = options?.groupId ?? "";
  zeroAmountSuccess.value = options?.success === "1";
  if (paymentNo.value) void queryPayment();
  else if (!zeroAmountSuccess.value) queryError.value = "支付参数不完整";
});
</script>

<style lang="scss" scoped>
.pay-result {
  padding: 64rpx 0 48rpx;
  text-align: center;

  &__hero {
    min-height: 304rpx;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 152rpx;
    height: 152rpx;
    margin: 0 auto;
    font-size: 72rpx;
    font-weight: 600;
    color: $color-text-sub;
    background: $color-surface-warm;
    border-radius: 50%;

    &--success {
      color: $color-primary;
      background: $color-primary-tint;
    }

    &--pending {
      color: $color-primary;
      background: $color-primary-tint;
    }

    &--error {
      color: $color-danger;
      background: $color-surface-rose;
    }
  }

  &__title {
    margin-top: 40rpx;
    font-size: 42rpx;
    font-weight: 700;
    color: $color-text-title;
    letter-spacing: 2rpx;
  }

  &__description {
    max-width: 560rpx;
    margin: $spacing-sm auto 0;
    font-size: $font-size-sm;
    line-height: 1.7;
    color: $color-text-sub;
  }

  &__card {
    padding: $spacing-sm $spacing-lg;
    margin-top: 48rpx;
    text-align: left;
    background: $color-bg;
    border-radius: $radius-card;
  }

  &__row {
    display: flex;
    gap: $spacing-md;
    justify-content: space-between;
    padding: 24rpx 0;
    font-size: $font-size-sm;
    color: $color-text-sub;
    border-bottom: 1rpx solid $color-line;

    &:last-child {
      border-bottom: 0;
    }

    text:last-child {
      color: $color-text-content;
      text-align: right;
      word-break: break-all;
    }
  }

  &__error {
    padding: $spacing-sm $spacing-md;
    margin-top: $spacing-md;
    font-size: $font-size-sm;
    color: $color-danger;
    background: $color-surface-rose;
    border-radius: $radius-input;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
    margin-top: 48rpx;
  }

  &__text-action {
    padding: $spacing-sm;
    margin: 0;
    font-size: $font-size-sm;
    line-height: 1.4;
    color: $color-text-placeholder;
    background: transparent;

    &::after {
      border: 0;
    }
  }
}
</style>
