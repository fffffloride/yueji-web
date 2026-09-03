<template>
  <YjPage :padded="false" :has-footer="hasActions">
    <view v-if="loading && !order" class="detail-state">
      <wd-loading />
      <text>正在加载订单</text>
    </view>

    <view v-else-if="!order" class="detail-state">
      <YjEmpty image="network" :text="loadError || '订单详情不可用'">
        <wd-button size="small" type="primary" @click="loadOrder">重新加载</wd-button>
      </YjEmpty>
    </view>

    <template v-else>
      <view class="detail-hero" :class="`detail-hero--${statusTone}`">
        <view class="detail-hero__status">
          {{ isGiftRecipient ? `好友赠礼 · ${order.statusLabel}` : order.statusLabel }}
        </view>
        <view class="detail-hero__description">{{ statusDescription }}</view>
      </view>

      <view class="detail-content">
        <view class="detail-section">
          <view class="detail-section__title">项目清单</view>
          <view v-for="item in order.items" :key="item.id" class="detail-item">
            <image
              v-if="item.productImage && !failedImageIds.includes(item.id)"
              class="detail-item__image"
              :src="item.productImage"
              mode="aspectFill"
              @error="failedImageIds.push(item.id)"
            />
            <view v-else class="detail-item__image detail-item__placeholder">悦己</view>
            <view class="detail-item__content">
              <view class="detail-item__name">{{ item.productName }}</view>
              <view v-if="item.skuName" class="detail-item__sku">{{ item.skuName }}</view>
              <view class="detail-item__bottom">
                <text v-if="!isGiftRecipient && item.price !== undefined">
                  {{ formatPrice(item.price, true) }}
                </text>
                <text v-else>好友赠礼</text>
                <text>×{{ item.quantity }}</text>
              </view>
            </view>
          </view>
          <view v-if="order.items.length === 0" class="detail-section__empty">
            项目详情暂不可用
          </view>
        </view>

        <view v-if="hasServiceInfo" class="detail-section detail-service">
          <view class="detail-section__title">到店服务</view>
          <view v-if="showVerifyCode" class="detail-verify">
            <text>到店核销码</text>
            <text class="detail-verify__code">{{ formattedVerifyCode }}</text>
            <text class="detail-verify__hint">到店后请向工作人员出示</text>
          </view>
          <view v-if="order.appointment" class="detail-row">
            <text>预约状态</text>
            <text>{{ appointmentStatusLabel }}</text>
          </view>
          <view v-else-if="order.canBookAppointment" class="detail-service__hint">
            该项目尚未预约，请选择合适的到店时间
          </view>
          <view v-if="order.verifyTime" class="detail-row">
            <text>核销时间</text>
            <text>{{ formatDate(order.verifyTime) }}</text>
          </view>
        </view>

        <view v-if="hasContact" class="detail-section">
          <view class="detail-section__title">联系信息</view>
          <view v-if="order.contactName" class="detail-row">
            <text>联系人</text>
            <text>{{ order.contactName }}</text>
          </view>
          <view v-if="order.contactMobile" class="detail-row">
            <text>手机号</text>
            <text>{{ order.contactMobile }}</text>
          </view>
          <view v-if="order.remark" class="detail-row detail-row--wrap">
            <text>备注</text>
            <text>{{ order.remark }}</text>
          </view>
        </view>

        <view v-if="showPricing" class="detail-section detail-price">
          <view class="detail-section__title">金额明细</view>
          <view class="detail-row">
            <text>商品金额</text>
            <text>{{ formatPrice(order.pricing!.totalAmount, true) }}</text>
          </view>
          <view v-if="order.pricing!.memberDiscount > 0" class="detail-row detail-price__discount">
            <text>会员优惠</text>
            <text>-{{ formatPrice(order.pricing!.memberDiscount, true) }}</text>
          </view>
          <view v-if="order.pricing!.couponAmount > 0" class="detail-row detail-price__discount">
            <text>优惠券</text>
            <text>-{{ formatPrice(order.pricing!.couponAmount, true) }}</text>
          </view>
          <view v-if="order.pricing!.pointsDeduct > 0" class="detail-row detail-price__discount">
            <text>积分抵扣（{{ order.pricing!.pointsUsed }} 积分）</text>
            <text>-{{ formatPrice(order.pricing!.pointsDeduct, true) }}</text>
          </view>
          <view class="detail-row detail-price__pay">
            <text>实付</text>
            <text>{{ formatPrice(order.pricing!.payAmount, true) }}</text>
          </view>
        </view>

        <view class="detail-section">
          <view class="detail-section__title">订单信息</view>
          <view class="detail-row detail-row--wrap">
            <text>订单编号</text>
            <text>{{ order.orderNo }}</text>
          </view>
          <view class="detail-row">
            <text>下单时间</text>
            <text>{{ formatDate(order.createTime) }}</text>
          </view>
          <view v-if="order.payTime" class="detail-row">
            <text>支付时间</text>
            <text>{{ formatDate(order.payTime) }}</text>
          </view>
          <view v-if="order.cancelTime" class="detail-row">
            <text>取消时间</text>
            <text>{{ formatDate(order.cancelTime) }}</text>
          </view>
          <view v-if="order.cancelReason" class="detail-row detail-row--wrap">
            <text>取消原因</text>
            <text>{{ order.cancelReason }}</text>
          </view>
        </view>
      </view>
    </template>

    <YjAppointmentDrawer
      v-model:visible="appointmentDrawerVisible"
      :order-id="order?.id"
      @success="handleAppointmentSuccess"
    />

    <template #footer>
      <view v-if="order && hasActions" class="detail-footer">
        <template v-if="order.status === OrderStatusEnum.UNPAID">
          <view
            class="detail-footer__button"
            :class="{ 'is-disabled': actionLoading }"
            @click="cancelOrder"
          >
            取消订单
          </view>
          <view
            v-if="order.canProxyPay"
            class="detail-footer__button"
            :class="{ 'is-disabled': actionLoading }"
            @click="openProxyPay"
          >
            好友代付
          </view>
          <view
            class="detail-footer__button detail-footer__button--primary"
            :class="{ 'is-disabled': actionLoading }"
            @click="continuePayment"
          >
            {{ actionLoading ? "处理中" : "继续支付" }}
          </view>
        </template>
        <template v-else-if="order.status === OrderStatusEnum.PAID">
          <view v-if="showGiftAction" class="detail-footer__button" @click="openGift">
            {{ giftActionLabel }}
          </view>
          <view
            v-if="order.canBookAppointment"
            class="detail-footer__button detail-footer__button--primary"
            @click="appointmentDrawerVisible = true"
          >
            预约到店
          </view>
        </template>
      </view>
    </template>
  </YjPage>
</template>

<script setup lang="ts">
import { AppointmentStatus, AppointmentTab } from "@/api/appointment";
import OrderAPI, { type OrderDetail } from "@/api/order";
import PayAPI from "@/api/pay";
import { RoutePath } from "@/constants";
import { OrderStatusEnum } from "@/enums/order";
import { formatDate, formatPrice } from "@/utils/format";
import { navigate } from "@/utils/navigate";
import { invokeWechatPayment } from "@/utils/payment";

const orderId = ref("");
const order = ref<OrderDetail>();
const loading = ref(false);
const loadError = ref("");
const actionLoading = ref(false);
const appointmentDrawerVisible = ref(false);
const failedImageIds = ref<string[]>([]);

const isGiftRecipient = computed(() => order.value?.viewerRole === "BENEFICIARY");
const showVerifyCode = computed(
  () => order.value?.status === OrderStatusEnum.PAID && Boolean(order.value.verifyCode)
);
const formattedVerifyCode = computed(() =>
  (order.value?.verifyCode ?? "").replace(/(\d{4})(?=\d)/g, "$1 ")
);
const hasServiceInfo = computed(() =>
  Boolean(
    showVerifyCode.value ||
    order.value?.appointment ||
    order.value?.canBookAppointment ||
    order.value?.verifyTime
  )
);
const hasContact = computed(() =>
  Boolean(order.value?.contactName || order.value?.contactMobile || order.value?.remark)
);
const showPricing = computed(() => !isGiftRecipient.value && Boolean(order.value?.pricing));
const showGiftAction = computed(() =>
  Boolean(order.value?.canGift || order.value?.giftId || order.value?.canReturnGift)
);
const giftActionLabel = computed(() => {
  if (order.value?.canGift) return "赠送好友";
  return isGiftRecipient.value ? "赠礼记录" : "转赠记录";
});
const hasActions = computed(
  () =>
    order.value?.status === OrderStatusEnum.UNPAID ||
    (order.value?.status === OrderStatusEnum.PAID &&
      (showGiftAction.value || order.value.canBookAppointment))
);
const appointmentStatusLabel = computed(() => {
  if (order.value?.appointment?.status === AppointmentStatus.BOOKED) return "已预约，待到店";
  if (order.value?.appointment?.status === AppointmentStatus.COMPLETED) return "服务已完成";
  return "预约已取消";
});
const statusTone = computed(() => {
  if (order.value?.status === OrderStatusEnum.UNPAID) return "warning";
  if (
    order.value?.status === OrderStatusEnum.CANCELLED ||
    order.value?.status === OrderStatusEnum.REFUNDED
  )
    return "muted";
  return "primary";
});
const statusDescription = computed(() => {
  if (!order.value) return "";
  if (order.value.status === OrderStatusEnum.UNPAID) return "请尽快完成支付，超时订单将自动关闭";
  if (order.value.status === OrderStatusEnum.PAID) {
    if (order.value.appointment) return "已完成预约，请按预约安排到店";
    if (order.value.canBookAppointment) return "项目已购买成功，预约时间后到店体验";
    return "项目已购买成功，到店时请出示核销码";
  }
  if (order.value.status === OrderStatusEnum.VERIFIED) return "项目已核销，服务记录已生成";
  if (order.value.status === OrderStatusEnum.COMPLETED) return "本次服务已完成，感谢选择悦己";
  if (order.value.status === OrderStatusEnum.CANCELLED)
    return "订单已取消，优惠与库存以最新状态为准";
  return "订单已退款，到账时间以支付渠道为准";
});

async function loadOrder(): Promise<void> {
  if (!orderId.value || loading.value) return;
  loading.value = true;
  loadError.value = "";
  try {
    order.value = await OrderAPI.getDetail(orderId.value);
    failedImageIds.value = [];
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : "订单加载失败";
  } finally {
    loading.value = false;
  }
}

async function cancelOrder(): Promise<void> {
  if (!order.value || actionLoading.value) return;
  const { confirm } = await uni.showModal({
    title: "取消订单",
    content: "确定取消该订单吗？取消后库存和已锁定优惠将按服务端结果恢复。",
    confirmText: "确认取消",
  });
  if (!confirm) return;

  actionLoading.value = true;
  try {
    order.value = await OrderAPI.cancel(order.value.id);
  } finally {
    actionLoading.value = false;
  }
}

async function continuePayment(): Promise<void> {
  if (!order.value || actionLoading.value) return;
  actionLoading.value = true;
  try {
    if (order.value.payAmount === 0) {
      navigate(RoutePath.ORDER_PAY_RESULT, {
        params: { orderId: order.value.id, orderNo: order.value.orderNo, success: 1 },
      });
      return;
    }
    const payment = await PayAPI.create(order.value.id);
    await invokeWechatPayment(payment);
    navigate(RoutePath.ORDER_PAY_RESULT, {
      params: {
        orderId: order.value.id,
        paymentNo: payment.paymentNo,
        orderNo: order.value.orderNo,
      },
    });
  } finally {
    actionLoading.value = false;
  }
}

function openProxyPay(): void {
  if (!order.value?.canProxyPay) return;
  navigate(RoutePath.ORDER_PROXY_PAY, { params: { orderId: order.value.id } });
}

function openGift(): void {
  if (!order.value) return;
  navigate(RoutePath.ORDER_GIFT, {
    params: order.value.canGift
      ? { orderId: order.value.id }
      : { direction: isGiftRecipient.value ? "RECEIVED" : "SENT" },
  });
}

async function handleAppointmentSuccess(): Promise<void> {
  await loadOrder();
  const { confirm } = await uni.showModal({
    title: "预约成功",
    content: "已为你保留到店时间。",
    cancelText: "留在订单",
    confirmText: "查看预约",
  });
  if (confirm) navigate(RoutePath.APPOINTMENT, { params: { tab: AppointmentTab.PENDING_ARRIVAL } });
}

onLoad((options) => {
  orderId.value = String(options?.id ?? "");
  if (!orderId.value) {
    loadError.value = "订单参数不完整";
    return;
  }
  void loadOrder();
});

onShow(() => {
  if (order.value) void loadOrder();
});

onPullDownRefresh(async () => {
  await loadOrder();
  uni.stopPullDownRefresh();
});
</script>

<style lang="scss" scoped>
.detail-state {
  display: flex;
  gap: $spacing-sm;
  align-items: center;
  justify-content: center;
  min-height: 640rpx;
  color: $color-text-sub;
}

.detail-hero {
  padding: 48rpx $page-padding 52rpx;
  color: $color-bg;
  background: linear-gradient(135deg, $color-primary-dark, $color-primary-light);

  &--warning {
    background: linear-gradient(135deg, $color-primary-dark, #80663d);
  }

  &--muted {
    background: linear-gradient(135deg, $color-text-content, $color-text-placeholder);
  }

  &__status {
    font-size: 44rpx;
    font-weight: 700;
    letter-spacing: 2rpx;
  }

  &__description {
    margin-top: $spacing-sm;
    font-size: $font-size-sm;
    line-height: 1.6;
    opacity: 0.84;
  }
}

.detail-content {
  padding: $spacing-md $page-padding;
}

.detail-section {
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
  background: $color-bg;
  border-radius: $radius-card;

  &__title {
    margin-bottom: $spacing-md;
    font-size: $font-size-lg;
    font-weight: 700;
    color: $color-text-title;
  }

  &__empty {
    padding: $spacing-lg 0;
    font-size: $font-size-sm;
    color: $color-text-placeholder;
    text-align: center;
  }
}

.detail-item {
  display: flex;
  gap: $spacing-md;
  padding: $spacing-md 0;
  border-bottom: 1rpx solid $color-line;

  &:last-child {
    border-bottom: 0;
  }

  &__image {
    display: flex;
    flex: 0 0 156rpx;
    align-items: center;
    justify-content: center;
    width: 156rpx;
    height: 156rpx;
    background: $color-bg-page;
    border-radius: $radius-input;
  }

  &__placeholder {
    font-size: $font-size-sm;
    color: $color-primary;
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-weight: 600;
    color: $color-text-title;

    @include ellipsis-multi(2);
  }

  &__sku {
    margin-top: $spacing-xs;
    font-size: $font-size-sm;
    color: $color-text-sub;
  }

  &__bottom {
    display: flex;
    justify-content: space-between;
    margin-top: $spacing-md;
    font-weight: 600;
  }
}

.detail-verify {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-lg;
  margin-bottom: $spacing-sm;
  font-size: $font-size-sm;
  color: $color-primary;
  background: $color-primary-tint;
  border-radius: $radius-input;

  &__code {
    margin: $spacing-xs 0;
    font-size: 52rpx;
    font-weight: 700;
    color: $color-primary-dark;
    letter-spacing: 8rpx;
  }

  &__hint {
    font-size: $font-size-xs;
    color: $color-primary-light;
  }
}

.detail-service__hint {
  padding: $spacing-md;
  font-size: $font-size-sm;
  line-height: 1.6;
  color: $color-primary;
  background: $color-primary-tint;
  border-radius: $radius-input;
}

.detail-row {
  display: flex;
  gap: $spacing-md;
  justify-content: space-between;
  padding: $spacing-sm 0;
  color: $color-text-sub;
  border-bottom: 1rpx solid $color-line;

  &:last-child {
    border-bottom: 0;
  }

  text:last-child {
    color: $color-text-content;
    text-align: right;
  }

  &--wrap text:last-child {
    max-width: 460rpx;
    word-break: break-all;
  }
}

.detail-price {
  &__discount,
  &__discount text:last-child {
    color: $color-primary;
  }

  &__pay {
    padding-top: $spacing-md;
    margin-top: $spacing-sm;
    font-size: $font-size-lg;
    font-weight: 700;
    color: $color-text-title;
    border-top: 1rpx solid $color-line;

    text:last-child {
      color: $color-price;
    }
  }
}

.detail-footer {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
  justify-content: flex-end;

  &__button {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 152rpx;
    height: 68rpx;
    padding: 0 $spacing-md;
    font-size: $font-size-sm;
    color: $color-text-content;
    border: 2rpx solid $color-border;
    border-radius: 34rpx;

    &--primary {
      color: $color-bg;
      background: $color-primary-dark;
      border-color: $color-primary-dark;
    }

    &.is-disabled {
      pointer-events: none;
      opacity: 0.5;
    }
  }
}
</style>
