<template>
  <YjPage :padded="false" :has-footer="Boolean(quote && !loadError)">
    <view v-if="loading" class="confirm-status">
      <wd-loading />
      <text>正在试算订单</text>
    </view>

    <view v-else-if="loadError || !quote" class="confirm-status">
      <YjEmpty image="network" :text="loadError || '订单试算失败'">
        <wd-button size="small" type="primary" @click="loadCheckout">重新加载</wd-button>
      </YjEmpty>
    </view>

    <template v-else>
      <view v-if="createdOrder" class="confirm-created">
        订单 {{ createdOrder.orderNo }} 已创建，请继续完成支付
      </view>

      <view class="confirm-section">
        <view class="confirm-section__title">项目清单</view>
        <view v-for="item in displayItems" :key="item.skuId" class="confirm-item">
          <image v-if="item.image" class="confirm-item__image" :src="item.image" mode="aspectFill" />
          <view v-else class="confirm-item__image confirm-item__placeholder">悦己</view>
          <view class="confirm-item__content">
            <view class="confirm-item__name">{{ item.name }}</view>
            <view class="confirm-item__sku">{{ item.skuName }}</view>
            <view class="confirm-item__bottom">
              <text>{{ formatPrice(item.price, true) }}</text>
              <text>×{{ item.quantity }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="confirm-section confirm-form">
        <view class="confirm-section__title">联系信息</view>
        <wd-input
          v-model="contactName"
          label="联系人"
          required
          clearable
          maxlength="32"
          placeholder="请输入联系人姓名"
        />
        <wd-input
          v-model="contactMobile"
          label="手机号"
          required
          clearable
          type="tel"
          maxlength="11"
          placeholder="请输入手机号"
        />
        <wd-textarea
          v-model="remark"
          auto-height
          label="备注"
          clearable
          maxlength="255"
          placeholder="如有特殊需求可在此说明"
        />
      </view>

      <view class="confirm-section confirm-benefits">
        <view class="confirm-section__title confirm-benefits__title">
          <text>优惠抵扣</text>
          <wd-loading v-if="benefitsLoading" size="32rpx" />
        </view>
        <view
          class="confirm-benefits__row"
          :class="{ 'confirm-benefits__row--disabled': benefitsLocked }"
          @click="openCouponPopup"
        >
          <view>
            <view class="confirm-benefits__label">优惠券</view>
            <view class="confirm-benefits__hint">
              {{ selectedCoupon?.couponName || (coupons.length ? `${coupons.length} 张可用` : "暂无可用") }}
            </view>
          </view>
          <view class="confirm-benefits__action">
            <text v-if="quote.couponAmount > 0" class="confirm-benefits__discount">
              -{{ formatPrice(quote.couponAmount, true) }}
            </text>
            <text v-else>不使用</text>
            <wd-icon name="arrow-right" size="32rpx" />
          </view>
        </view>
        <view class="confirm-benefits__row">
          <view>
            <view class="confirm-benefits__label">积分抵扣</view>
            <view class="confirm-benefits__hint">{{ pointsHint }}</view>
          </view>
          <wd-switch
            :model-value="pointsEnabled && canUsePoints"
            :disabled="benefitsLocked || !canUsePoints"
            size="44rpx"
            @change="handlePointsChange"
          />
        </view>
      </view>

      <view class="confirm-section confirm-price">
        <view class="confirm-section__title">金额明细</view>
        <view class="confirm-price__row">
          <text>商品金额</text>
          <text>{{ formatPrice(quote.totalAmount, true) }}</text>
        </view>
        <view v-if="quote.memberDiscount > 0" class="confirm-price__row confirm-price__discount">
          <text>{{ quote.memberLevelName || "会员" }}优惠</text>
          <text>-{{ formatPrice(quote.memberDiscount, true) }}</text>
        </view>
        <view v-if="quote.couponAmount > 0" class="confirm-price__row confirm-price__discount">
          <text>优惠券</text>
          <text>-{{ formatPrice(quote.couponAmount, true) }}</text>
        </view>
        <view v-if="quote.pointsDeduct > 0" class="confirm-price__row confirm-price__discount">
          <text>积分抵扣</text>
          <text>-{{ formatPrice(quote.pointsDeduct, true) }}</text>
        </view>
        <view class="confirm-price__row confirm-price__pay">
          <text>应付</text>
          <text>{{ formatPrice(quote.payAmount, true) }}</text>
        </view>
      </view>
    </template>

    <wd-popup
      v-model="couponPopupVisible"
      position="bottom"
      root-portal
      safe-area-inset-bottom
      custom-style="border-radius: 24rpx 24rpx 0 0; overflow: hidden;"
    >
      <view class="coupon-popup">
        <view class="coupon-popup__header">
          <text>优惠券</text>
          <wd-icon name="close" size="44rpx" @click="couponPopupVisible = false" />
        </view>
        <scroll-view class="coupon-popup__list" scroll-y :show-scrollbar="false">
          <view
            class="coupon-popup__none"
            :class="{ 'coupon-popup__none--active': !selectedCouponId }"
            @click="selectCoupon('')"
          >
            <text>不使用优惠券</text>
            <view
              class="coupon-popup__check"
              :class="{ 'coupon-popup__check--active': !selectedCouponId }"
            >
              {{ !selectedCouponId ? "✓" : "" }}
            </view>
          </view>
          <view
            v-for="coupon in coupons"
            :key="coupon.memberCouponId"
            class="coupon-card"
            :class="{ 'coupon-card--active': selectedCouponId === coupon.memberCouponId }"
            @click="selectCoupon(coupon.memberCouponId)"
          >
            <view class="coupon-card__amount">
              <view class="coupon-card__amount-main">
                <text class="coupon-card__amount-symbol">¥</text>
                <text class="coupon-card__amount-value">{{ formatCouponAmount(coupon.couponAmount) }}</text>
                <text class="coupon-card__amount-unit">元</text>
              </view>
              <text class="coupon-card__amount-label">
                {{ coupon.thresholdAmount > 0 ? `满${formatCouponAmount(coupon.thresholdAmount)}可用` : "无门槛" }}
              </text>
            </view>
            <view class="coupon-card__content">
              <view class="coupon-card__name">{{ coupon.couponName || "优惠券" }}</view>
              <view v-if="coupon.validEnd" class="coupon-card__date">
                有效期至 {{ formatDate(coupon.validEnd) }}
              </view>
            </view>
            <view
              class="coupon-popup__check"
              :class="{
                'coupon-popup__check--active': selectedCouponId === coupon.memberCouponId,
              }"
            >
              {{ selectedCouponId === coupon.memberCouponId ? "✓" : "" }}
            </view>
          </view>
        </scroll-view>
      </view>
    </wd-popup>

    <template #footer>
      <view v-if="quote && !loadError" class="confirm-footer">
        <view class="confirm-footer__amount">
          <text>应付</text>
          <text>{{ formatPrice(quote.payAmount, true) }}</text>
        </view>
        <wd-button
          type="primary"
          :loading="submitting"
          :disabled="submitting || benefitsLoading"
          @click="submit"
        >
          {{ createdOrder ? "继续支付" : quote.payAmount === 0 ? "确认订单" : "提交订单" }}
        </wd-button>
      </view>
    </template>
  </YjPage>
</template>

<script setup lang="ts">
import OrderAPI, {
  type AvailableCoupon,
  type OrderDetail,
  type OrderForm,
  type OrderQuote,
} from "@/api/order";
import PayAPI from "@/api/pay";
import ProductAPI from "@/api/product";
import { RoutePath } from "@/constants";
import { useCartStore } from "@/stores/cart";
import { useUserStore } from "@/stores/user";
import {
  parseCheckoutSource,
  resolvePointsToUse,
  type CheckoutSource,
} from "@/utils/checkout";
import { formatDate, formatPrice } from "@/utils/format";
import { navigate } from "@/utils/navigate";
import { invokeWechatPayment } from "@/utils/payment";

interface DisplayItem {
  skuId: string;
  name: string;
  skuName: string;
  image: string;
  price: number;
  quantity: number;
}

const cartStore = useCartStore();
const userStore = useUserStore();
const source = ref<CheckoutSource>();
const displayItems = ref<DisplayItem[]>([]);
const quote = ref<OrderQuote>();
const coupons = ref<AvailableCoupon[]>([]);
const selectedCouponId = ref("");
const couponPopupVisible = ref(false);
const pointsEnabled = ref(true);
const createdOrder = ref<OrderDetail>();
const contactName = ref("");
const contactMobile = ref("");
const remark = ref("");
const loading = ref(false);
const submitting = ref(false);
const benefitsLoading = ref(false);
const loadError = ref("");
const routeOptions = ref<Record<string, string>>({});

const selectedCoupon = computed(() =>
  coupons.value.find((coupon) => coupon.memberCouponId === selectedCouponId.value)
);
const canUsePoints = computed(() => (quote.value?.maxUsablePoints ?? 0) > 0);
const benefitsLocked = computed(() => benefitsLoading.value || Boolean(createdOrder.value));
const pointsHint = computed(() => {
  if (!quote.value?.maxUsablePoints) return "暂无可抵扣积分";
  if (!pointsEnabled.value) return `本单最多可用 ${quote.value.maxUsablePoints} 积分`;
  return `使用 ${quote.value.pointsUsed} 积分，抵扣 ${formatPrice(quote.value.pointsDeduct, true)}`;
});

const formatCouponAmount = (cents: number) => formatPrice(cents).replace(/\.00$/, "");

async function loadDisplayItems() {
  if (!source.value) return;
  if ("cartIds" in source.value) {
    await cartStore.fetch();
    const ids = new Set(source.value.cartIds);
    const rows = cartStore.items.filter((item) => ids.has(item.id) && !item.invalid);
    if (rows.length !== ids.size) throw new Error("部分购物车项目已失效，请返回购物车重试");
    displayItems.value = rows.map((item) => ({
      skuId: item.skuId,
      name: item.productName,
      skuName: item.skuName,
      image: item.productImage,
      price: item.price,
      quantity: item.quantity,
    }));
    return;
  }

  const productId = routeOptions.value.productId;
  if (!productId) throw new Error("项目参数不完整");
  const product = await ProductAPI.getDetail(productId);
  const requested = source.value.items[0];
  const sku = product.skus.find((item) => item.id === requested.skuId);
  if (!sku || sku.stock < requested.quantity) throw new Error("所选规格已失效或库存不足");
  displayItems.value = [
    {
      skuId: sku.id,
      name: product.name,
      skuName: sku.name,
      image: product.cover,
      price: sku.price,
      quantity: requested.quantity,
    },
  ];
}

async function loadCheckout() {
  if (loading.value) return;
  loading.value = true;
  loadError.value = "";
  try {
    source.value = parseCheckoutSource(routeOptions.value);
    if (!userStore.userInfo.id) await userStore.fetchUserInfo();
    contactName.value ||= userStore.userInfo.nickname || "";
    contactMobile.value ||= userStore.userInfo.phone || "";
    await loadDisplayItems();
    try {
      coupons.value = await OrderAPI.availableCoupons(source.value);
    } catch {
      coupons.value = [];
    }
    selectedCouponId.value = coupons.value[0]?.memberCouponId ?? "";
    try {
      quote.value = await requestBenefitsQuote(selectedCouponId.value, pointsEnabled.value);
    } catch (error) {
      if (!selectedCouponId.value) throw error;
      selectedCouponId.value = "";
      quote.value = await requestBenefitsQuote("", pointsEnabled.value);
    }
  } catch (error) {
    quote.value = undefined;
    loadError.value = error instanceof Error ? error.message : "订单试算失败";
  } finally {
    loading.value = false;
  }
}

async function requestBenefitsQuote(couponId: string, usePoints: boolean) {
  if (!source.value) throw new Error("订单参数不完整");
  const form: OrderForm = {
    ...source.value,
    memberCouponId: couponId || undefined,
    pointsToUse: 0,
  };
  const baseQuote = await OrderAPI.quote(form);
  const pointsToUse = resolvePointsToUse(usePoints, baseQuote.maxUsablePoints);
  return pointsToUse ? OrderAPI.quote({ ...form, pointsToUse }) : baseQuote;
}

async function applyBenefits(couponId: string, usePoints: boolean): Promise<boolean> {
  if (!source.value || benefitsLocked.value) return false;
  benefitsLoading.value = true;
  try {
    const nextQuote = await requestBenefitsQuote(couponId, usePoints);
    quote.value = nextQuote;
    selectedCouponId.value = couponId;
    pointsEnabled.value = usePoints;
    return true;
  } catch {
    return false;
  } finally {
    benefitsLoading.value = false;
  }
}

function openCouponPopup() {
  if (!benefitsLocked.value && coupons.value.length) couponPopupVisible.value = true;
}

async function selectCoupon(couponId: string) {
  if (benefitsLoading.value) return;
  if (couponId === selectedCouponId.value) {
    couponPopupVisible.value = false;
    return;
  }
  if (await applyBenefits(couponId, pointsEnabled.value)) couponPopupVisible.value = false;
}

function handlePointsChange({ value }: { value: boolean | number | string }) {
  void applyBenefits(selectedCouponId.value, Boolean(value));
}

function validateContact(): boolean {
  if (!contactName.value.trim()) {
    uni.showToast({ title: "请填写联系人", icon: "none" });
    return false;
  }
  if (!/^1\d{10}$/.test(contactMobile.value.trim())) {
    uni.showToast({ title: "请填写正确的手机号", icon: "none" });
    return false;
  }
  return true;
}

async function continuePayment(order: OrderDetail) {
  if (order.payAmount === 0) {
    navigate(RoutePath.ORDER_PAY_RESULT, {
      redirect: true,
      params: { orderId: order.id, orderNo: order.orderNo, success: 1 },
    });
    return;
  }
  const payment = await PayAPI.create(order.id);
  await invokeWechatPayment(payment);
  navigate(RoutePath.ORDER_PAY_RESULT, {
    redirect: true,
    params: { orderId: order.id, paymentNo: payment.paymentNo, orderNo: order.orderNo },
  });
}

async function submit() {
  if (
    submitting.value ||
    benefitsLoading.value ||
    !source.value ||
    !quote.value ||
    !validateContact()
  )
    return;
  submitting.value = true;
  try {
    if (!createdOrder.value) {
      const form: OrderForm = {
        ...source.value,
        memberCouponId: quote.value.memberCouponId || undefined,
        pointsToUse: quote.value.pointsUsed,
        contactName: contactName.value.trim(),
        contactMobile: contactMobile.value.trim(),
        remark: remark.value.trim() || undefined,
      };
      createdOrder.value = await OrderAPI.create(form);
      if ("cartIds" in source.value) await cartStore.fetch();
    }
    await continuePayment(createdOrder.value);
  } finally {
    submitting.value = false;
  }
}

onLoad((options) => {
  routeOptions.value = (options ?? {}) as Record<string, string>;
  void loadCheckout();
});
</script>

<style lang="scss" scoped>
.confirm-status {
  display: flex;
  gap: $spacing-sm;
  align-items: center;
  justify-content: center;
  min-height: 640rpx;
  color: $color-text-sub;
}

.confirm-created {
  padding: $spacing-md $page-padding;
  font-size: $font-size-sm;
  color: $color-primary;
  background: #edf6ef;
}

.confirm-section {
  padding: $spacing-lg $page-padding;
  margin-bottom: $spacing-md;
  background: $color-bg;

  &__title {
    margin-bottom: $spacing-md;
    font-size: $font-size-lg;
    font-weight: 700;
    color: $color-text-title;
  }
}

.confirm-item {
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

.confirm-price {
  &__row {
    display: flex;
    justify-content: space-between;
    padding: $spacing-sm 0;
    color: $color-text-content;
  }

  &__discount {
    color: $color-primary;
  }

  &__pay {
    padding-top: $spacing-md;
    margin-top: $spacing-sm;
    font-size: $font-size-lg;
    font-weight: 700;
    color: $color-text-title;
    border-top: 1rpx solid $color-line;
  }
}

.confirm-benefits {
  &__title {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 104rpx;
    border-bottom: 1rpx solid $color-line;

    &:last-child {
      border-bottom: 0;
    }

    &--disabled {
      color: $color-text-disabled;
    }
  }

  &__label {
    color: $color-text-title;
  }

  &__hint {
    max-width: 480rpx;
    margin-top: 6rpx;
    overflow: hidden;
    font-size: $font-size-xs;
    color: $color-text-placeholder;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__action {
    display: flex;
    gap: 6rpx;
    align-items: center;
    font-size: $font-size-sm;
    color: $color-text-sub;
  }

  &__discount {
    color: $color-primary;
  }
}

.coupon-popup {
  height: 820rpx;
  max-height: 72vh;
  background: $color-bg;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 104rpx;
    padding: 0 $page-padding;
    font-size: $font-size-lg;
    font-weight: 700;
    color: $color-text-title;
  }

  &__list {
    box-sizing: border-box;
    width: 100%;
    height: calc(100% - 104rpx);
    padding: 0 $page-padding $spacing-lg;
  }

  &__none {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 88rpx;
    padding: 0 $spacing-md;
    margin-bottom: $spacing-md;
    color: $color-text-content;
    background: $color-bg-page;
    border: 2rpx solid transparent;
    border-radius: $radius-input;

    &--active {
      color: $color-primary;
      border-color: $color-primary-lighter;
    }
  }

  &__check {
    display: flex;
    flex: 0 0 44rpx;
    align-items: center;
    justify-content: center;
    width: 44rpx;
    height: 44rpx;
    font-size: $font-size-sm;
    font-weight: 700;
    color: transparent;
    background: $color-bg;
    border: 2rpx solid $color-text-disabled;
    border-radius: 50%;

    &--active {
      color: $color-bg;
      background: $color-primary;
      border-color: $color-primary;
    }
  }
}

.coupon-card {
  display: flex;
  align-items: stretch;
  min-height: 176rpx;
  margin-bottom: $spacing-md;
  overflow: hidden;
  background: rgb(45 90 61 / 6%);
  border: 2rpx solid transparent;
  border-radius: $radius-card;

  &--active {
    border-color: $color-primary-lighter;
  }

  &__amount {
    display: flex;
    flex: 0 0 190rpx;
    flex-direction: column;
    gap: $spacing-xs;
    align-items: center;
    justify-content: center;
    padding: $spacing-md;
    color: $color-primary;
    border-right: 2rpx dashed rgb(45 90 61 / 20%);
  }

  &__amount-main {
    display: flex;
    align-items: baseline;
    justify-content: center;
    line-height: 1;
  }

  &__amount-symbol,
  &__amount-unit {
    font-size: $font-size-sm;
    font-weight: 600;
  }

  &__amount-value {
    margin: 0 6rpx;
    font-size: 52rpx;
    font-weight: 700;
  }

  &__amount-label {
    font-size: $font-size-sm;
    text-align: center;
  }

  &__content {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
    padding: $spacing-md;
  }

  &__name {
    overflow: hidden;
    font-weight: 600;
    color: $color-text-title;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__date {
    margin-top: $spacing-sm;
    font-size: $font-size-xs;
    color: $color-text-placeholder;
  }

  .coupon-popup__check {
    align-self: center;
    margin-right: $spacing-md;
  }
}

.confirm-footer {
  display: flex;
  gap: $spacing-md;
  align-items: center;
  justify-content: space-between;

  &__amount {
    display: flex;
    flex-direction: column;
    font-size: $font-size-xs;
    color: $color-text-sub;

    text:last-child {
      font-size: $font-size-lg;
      font-weight: 700;
      color: $color-price;
    }
  }
}
</style>
