<template>
  <view class="gift-items">
    <view v-for="item in items" :key="item.id" class="gift-item">
      <image
        v-if="item.productImage && !failedImageIds.includes(item.id)"
        class="gift-item__image"
        :src="item.productImage"
        mode="aspectFill"
        @error="failedImageIds.push(item.id)"
      />
      <view v-else class="gift-item__image gift-item__image--placeholder">悦己</view>
      <view class="gift-item__info">
        <text class="gift-item__name">{{ item.productName }}</text>
        <text v-if="item.skuName" class="gift-item__sku">{{ item.skuName }}</text>
      </view>
      <text class="gift-item__quantity">×{{ item.quantity }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { OrderGiftItem } from "@/api/order-gift";

defineProps<{ items: OrderGiftItem[] }>();

const failedImageIds = ref<string[]>([]);
</script>

<style lang="scss" scoped>
.gift-items {
  display: flex;
  flex-direction: column;
}

.gift-item {
  display: flex;
  gap: $spacing-md;
  align-items: center;
  padding: $spacing-md 0;
  border-bottom: 2rpx solid $color-line;

  &:last-child {
    border-bottom: 0;
  }
}

.gift-item__image {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 112rpx;
  height: 112rpx;
  overflow: hidden;
  color: $color-text-placeholder;
  background: $color-bg-page;
  border-radius: $radius-input;
}

.gift-item__info {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.gift-item__name {
  font-size: $font-size-md;
  font-weight: 500;
  color: $color-text-title;
}

.gift-item__sku,
.gift-item__quantity {
  margin-top: $spacing-xs;
  font-size: $font-size-sm;
  color: $color-text-placeholder;
}
</style>
