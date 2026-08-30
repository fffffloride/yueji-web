<template>
  <view class="yj-rank" @click="emit('click')">
    <view class="yj-rank__thumb" :style="{ background: product.bg }">
      <text class="yj-rank__badge">NO.{{ product.rank }}</text>
      <text class="yj-rank__tag">{{ product.tag }}</text>
    </view>
    <view class="yj-rank__info">
      <view class="yj-rank__name">{{ product.name }}</view>
      <view class="yj-rank__desc">{{ product.desc }}</view>
      <view class="yj-rank__meta">
        <text>{{ product.rating }}</text>
        <text>{{ product.users }}</text>
      </view>
      <view class="yj-rank__price">
        <text class="yj-rank__current">{{ formatPrice(product.price, true) }}</text>
        <text class="yj-rank__suffix">起</text>
        <text class="yj-rank__original">{{ formatPrice(product.original, true) }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { HotProduct } from "@/mocks/home";
import { formatPrice } from "@/utils/format";

/** 热榜条目：名次徽章 + 商品信息。 */
defineProps<{
  product: HotProduct;
}>();

const emit = defineEmits<{
  (e: "click"): void;
}>();
</script>

<style lang="scss" scoped>
.yj-rank {
  display: flex;
  gap: $spacing-md;
  padding: $spacing-md 0;
}

.yj-rank:not(:last-child) {
  @include hairline(bottom);
}

.yj-rank__thumb {
  position: relative;
  display: flex;
  flex-shrink: 0;
  align-items: flex-end;
  justify-content: center;
  width: 176rpx;
  height: 176rpx;
  overflow: hidden;
  border-radius: 24rpx;
}

.yj-rank__badge {
  position: absolute;
  top: 0;
  left: 0;
  padding: 4rpx 12rpx;
  font-size: 20rpx;
  font-weight: bold;
  color: $color-bg;
  background-color: $color-gold;
  border-radius: 24rpx 0 16rpx;
}

.yj-rank__tag {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 4rpx 0;
  font-size: 16rpx;
  color: $color-bg;
  text-align: center;
  background-color: rgb(0 0 0 / 45%);
  border-radius: 0 0 24rpx 24rpx;
}

.yj-rank__info {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.yj-rank__name {
  font-size: $font-size-md;
  font-weight: bold;
  color: $color-text-title;
}

.yj-rank__desc {
  margin-top: 2rpx;
  font-size: $font-size-sm;
  color: $color-text-sub;
}

.yj-rank__meta {
  display: flex;
  gap: $spacing-sm;
  margin-top: $spacing-xs;
  font-size: $font-size-sm;
  color: $color-primary;
}

.yj-rank__price {
  display: flex;
  gap: $spacing-xs;
  align-items: baseline;
  margin-top: $spacing-xs;
}

.yj-rank__current {
  font-size: $font-size-lg;
  font-weight: bold;
  color: $color-text-title;
}

.yj-rank__suffix {
  font-size: $font-size-xs;
  color: $color-text-placeholder;
}

.yj-rank__original {
  font-size: $font-size-xs;
  color: $color-text-placeholder;
  text-decoration: line-through;
}
</style>
