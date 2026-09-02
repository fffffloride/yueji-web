<template>
  <view class="order-card">
    <view class="order-card__head" @click="emit('detail', order)">
      <text class="order-card__time">下单时间：{{ formatDate(order.createTime) }}</text>
      <text class="order-card__status" :class="`order-card__status--${statusTone}`">
        {{ order.statusLabel }}
      </text>
    </view>

    <view class="order-card__items" @click="emit('detail', order)">
      <view v-for="item in order.items" :key="item.id" class="order-card__item">
        <image
          v-if="item.productImage && !failedImageIds.includes(item.id)"
          class="order-card__image"
          :src="item.productImage"
          mode="aspectFill"
          @error="failedImageIds.push(item.id)"
        />
        <view v-else class="order-card__image order-card__image--placeholder">悦己</view>

        <view class="order-card__product">
          <text class="order-card__name">{{ item.productName }}</text>
          <text v-if="item.skuName" class="order-card__sku">{{ item.skuName }}</text>
          <text class="order-card__quantity">×{{ item.quantity }}</text>
        </view>
        <text class="order-card__item-price">{{ formatPrice(item.price, true) }}</text>
      </view>

      <view v-if="order.items.length === 0" class="order-card__empty-item">项目详情暂不可用</view>
    </view>

    <view class="order-card__summary">
      <text>共 {{ totalQuantity }} 个项目</text>
      <view class="order-card__paid">
        <text>实付：</text>
        <text class="order-card__paid-price">{{ formatPrice(order.payAmount, true) }}</text>
      </view>
    </view>

    <view class="order-card__actions">
      <template v-if="order.status === OrderStatusEnum.UNPAID">
        <view
          class="order-card__button"
          :class="{ 'is-disabled': actionLoading }"
          @click.stop="emit('cancel', order)"
        >
          取消订单
        </view>
        <view
          class="order-card__button order-card__button--primary"
          :class="{ 'is-disabled': actionLoading }"
          @click.stop="emit('pay', order)"
        >
          继续支付
        </view>
      </template>
      <template v-else-if="order.status === OrderStatusEnum.PAID">
        <view class="order-card__button" @click.stop="emit('detail', order)">查看详情</view>
        <view
          class="order-card__button order-card__button--primary"
          @click.stop="emit('appointment', order)"
        >
          预约到店
        </view>
      </template>
      <view v-else class="order-card__button" @click.stop="emit('detail', order)">查看详情</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { OrderListItem } from "@/api/order";
import { OrderStatusEnum } from "@/enums/order";
import { formatDate, formatPrice } from "@/utils/format";

const props = defineProps<{
  order: OrderListItem;
  actionLoading?: boolean;
}>();

const emit = defineEmits<{
  (e: "cancel", order: OrderListItem): void;
  (e: "detail", order: OrderListItem): void;
  (e: "pay", order: OrderListItem): void;
  (e: "appointment", order: OrderListItem): void;
}>();

const failedImageIds = ref<string[]>([]);

const totalQuantity = computed(() =>
  props.order.items.reduce((total, item) => total + item.quantity, 0)
);

const statusTone = computed(() => {
  if (props.order.status === OrderStatusEnum.UNPAID) return "warning";
  if (props.order.status === OrderStatusEnum.PAID) return "primary";
  if (
    props.order.status === OrderStatusEnum.CANCELLED ||
    props.order.status === OrderStatusEnum.REFUNDED
  )
    return "muted";
  return "success";
});
</script>

<style lang="scss" scoped>
.order-card {
  margin-bottom: $spacing-md;
  overflow: hidden;
  background: $color-bg;
  border-radius: $radius-card;
}

.order-card__head {
  display: flex;
  gap: $spacing-md;
  align-items: center;
  justify-content: space-between;
  min-height: 80rpx;
  padding: 0 $spacing-md;
  border-bottom: 2rpx solid $color-line;
}

.order-card__time {
  font-size: $font-size-sm;
  font-weight: 500;
  color: $color-text-content;
}

.order-card__status {
  flex-shrink: 0;
  font-size: $font-size-sm;

  &--warning {
    color: $color-price;
  }

  &--primary {
    color: $color-primary;
  }

  &--success {
    color: $color-success;
  }

  &--muted {
    color: $color-text-placeholder;
  }
}

.order-card__items {
  padding: 0 $spacing-md;
}

.order-card__item {
  display: flex;
  gap: $spacing-md;
  min-height: 176rpx;
  padding: $spacing-md 0;
  border-bottom: 2rpx solid $color-line;

  &:last-child {
    border-bottom: 0;
  }
}

.order-card__image {
  flex-shrink: 0;
  width: 136rpx;
  height: 136rpx;
  background: $color-bg-page;
  border-radius: $radius-input;

  &--placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $font-size-sm;
    color: $color-text-placeholder;
  }
}

.order-card__product {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.order-card__name {
  display: -webkit-box;
  overflow: hidden;
  font-size: $font-size-md;
  font-weight: 500;
  line-height: 1.45;
  color: $color-text-title;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.order-card__sku,
.order-card__quantity {
  margin-top: $spacing-xs;
  font-size: $font-size-sm;
  color: $color-text-placeholder;
}

.order-card__quantity {
  margin-top: auto;
}

.order-card__item-price {
  flex-shrink: 0;
  font-size: $font-size-md;
  font-weight: 600;
  color: $color-text-title;
}

.order-card__empty-item {
  padding: 48rpx 0;
  font-size: $font-size-sm;
  color: $color-text-placeholder;
  text-align: center;
}

.order-card__summary {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 68rpx;
  padding: 0 $spacing-md;
  font-size: $font-size-sm;
  color: $color-text-sub;
  border-top: 2rpx solid $color-line;
}

.order-card__paid {
  display: flex;
  align-items: baseline;
  margin-left: $spacing-md;
}

.order-card__paid-price {
  font-size: $font-size-lg;
  font-weight: 700;
  color: $color-text-title;
}

.order-card__actions {
  display: flex;
  gap: $spacing-sm;
  justify-content: flex-end;
  padding: 0 $spacing-md $spacing-md;
}

.order-card__button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 152rpx;
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

  &.is-disabled {
    pointer-events: none;
    opacity: 0.5;
  }
}
</style>
