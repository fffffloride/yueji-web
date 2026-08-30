<template>
  <YjPage>
    <view class="pay-result">
      <view class="pay-result__icon" :class="`pay-result__icon--${state.tone}`">
        {{ state.symbol }}
      </view>
      <view class="pay-result__title">{{ state.title }}</view>
      <view class="pay-result__description">{{ state.description }}</view>

      <view v-if="orderNo || payment" class="pay-result__card">
        <view v-if="orderNo" class="pay-result__row">
          <text>订单号</text>
          <text>{{ orderNo }}</text>
        </view>
        <view v-if="payment" class="pay-result__row">
          <text>支付金额</text>
          <text>{{ formatPrice(payment.amount, true) }}</text>
        </view>
        <view v-if="payment?.paidTime" class="pay-result__row">
          <text>支付时间</text>
          <text>{{ formatDate(payment.paidTime) }}</text>
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
          v-if="paymentNo && payment?.status === PaymentStatusEnum.PENDING"
          type="primary"
          plain
          block
          :loading="loading"
          @click="queryPayment"
        >
          刷新支付结果
        </wd-button>
        <wd-button type="primary" plain block @click="navigate(RoutePath.HOME)">
          返回首页
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
const orderNo = ref("");
const zeroAmountSuccess = ref(false);
const loading = ref(false);
const submitting = ref(false);
const queryError = ref("");

const state = computed(() => {
  if (zeroAmountSuccess.value || payment.value?.status === PaymentStatusEnum.SUCCESS) {
    return {
      tone: "success",
      symbol: "✓",
      title: "支付成功",
      description: "订单已支付，请按订单安排到店服务",
    };
  }
  if (payment.value?.status === PaymentStatusEnum.FAILED) {
    return {
      tone: "error",
      symbol: "!",
      title: "支付失败",
      description: "本次支付未完成，请稍后重试",
    };
  }
  if (payment.value?.status === PaymentStatusEnum.REFUNDED) {
    return {
      tone: "default",
      symbol: "↩",
      title: "订单已退款",
      description: "退款状态以订单记录为准",
    };
  }
  return {
    tone: "pending",
    symbol: "…",
    title: loading.value ? "正在查询支付结果" : "等待支付",
    description: queryError.value ? "暂时无法确认支付状态" : "请完成支付后刷新结果",
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

onLoad((options) => {
  paymentNo.value = options?.paymentNo ?? "";
  orderNo.value = options?.orderNo ?? "";
  zeroAmountSuccess.value = options?.success === "1";
  if (paymentNo.value) void queryPayment();
  else if (!zeroAmountSuccess.value) queryError.value = "支付参数不完整";
});
</script>

<style lang="scss" scoped>
.pay-result {
  padding-top: 96rpx;
  text-align: center;

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 128rpx;
    height: 128rpx;
    margin: 0 auto;
    font-size: 64rpx;
    font-weight: 700;
    color: #fff;
    background: $color-text-placeholder;
    border-radius: 50%;

    &--success {
      background: $color-success;
    }

    &--pending {
      background: $color-primary;
    }

    &--error {
      background: $color-danger;
    }
  }

  &__title {
    margin-top: $spacing-lg;
    font-size: $font-size-xl;
    font-weight: 700;
    color: $color-text-title;
  }

  &__description {
    margin-top: $spacing-sm;
    font-size: $font-size-sm;
    color: $color-text-sub;
  }

  &__card {
    padding: $spacing-md;
    margin-top: 64rpx;
    text-align: left;
    background: $color-bg;
    border-radius: $radius-card;
  }

  &__row {
    display: flex;
    gap: $spacing-md;
    justify-content: space-between;
    padding: $spacing-sm 0;
    font-size: $font-size-sm;
    color: $color-text-sub;

    text:last-child {
      color: $color-text-content;
      text-align: right;
      word-break: break-all;
    }
  }

  &__error {
    margin-top: $spacing-md;
    font-size: $font-size-sm;
    color: $color-danger;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
    margin-top: 56rpx;
  }
}
</style>
