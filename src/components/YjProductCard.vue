<template>
  <view class="yj-product" @click="emit('click')">
    <view class="yj-product__thumb">
      <view class="yj-product__thumb-bar" />
    </view>
    <view class="yj-product__info">
      <view class="yj-product__head">
        <text class="yj-product__name">{{ product.name }}</text>
        <text v-if="product.badge" class="yj-product__badge">{{ product.badge }}</text>
      </view>
      <text class="yj-product__sub">{{ product.sub }}</text>
      <view v-if="product.sold" class="yj-product__meta">
        <text>{{ product.sold }}</text>
        <template v-if="product.isFriendly">
          <wd-icon name="heart" size="22rpx" color="var(--yj-color-primary)" />
          <text class="yj-product__friendly">疼痛友好</text>
        </template>
      </view>
      <view class="yj-product__price">
        <text class="yj-product__current">{{ formatPrice(product.price, true) }}</text>
        <text class="yj-product__suffix">起</text>
        <text class="yj-product__discount">{{ product.discount }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { ProjectItem } from "@/mocks/project";
import { formatPrice } from "@/utils/format";

/** 商品卡：缩略占位图 + 名称/标签/销量/价格，项目页与推荐位共用。 */
defineProps<{
  product: ProjectItem;
}>();

const emit = defineEmits<{
  (e: "click"): void;
}>();
</script>

<style lang="scss" scoped>
.yj-product {
  display: flex;
  gap: $spacing-md;
  padding: $spacing-md 0;

  &:not(:last-child) {
    @include hairline(bottom);
  }
}

.yj-product__thumb {
  position: relative;
  flex-shrink: 0;
  width: 180rpx;
  height: 180rpx;
  overflow: hidden;
  background: linear-gradient(135deg, $color-primary-tint, $color-surface-warm);
  border-radius: 24rpx;
}

.yj-product__thumb-bar {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 6rpx;
  background-color: $color-primary;
}

.yj-product__info {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  padding: 2rpx 0;
}

.yj-product__head {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
  align-items: center;
}

.yj-product__name {
  font-size: $font-size-md;
  font-weight: bold;
  color: $color-text-title;
}

.yj-product__badge {
  padding: 2rpx 10rpx;
  font-size: 18rpx;
  font-weight: bold;
  color: $color-bg;
  background-color: $color-primary;
  border-radius: 6rpx;
}

.yj-product__sub {
  margin-top: 2rpx;
  font-size: $font-size-sm;
  color: $color-text-sub;

  @include ellipsis;
}

.yj-product__meta {
  display: flex;
  gap: $spacing-xs;
  align-items: center;
  margin-top: 2rpx;
  font-size: $font-size-xs;
  color: $color-text-placeholder;
}

.yj-product__friendly {
  color: $color-primary;
}

.yj-product__price {
  display: flex;
  gap: $spacing-sm;
  align-items: center;
}

.yj-product__current {
  font-size: $font-size-lg;
  font-weight: bold;
  color: $color-text-title;
}

.yj-product__suffix {
  font-size: $font-size-xs;
  color: $color-text-placeholder;
}

.yj-product__discount {
  padding: 2rpx 12rpx;
  font-size: $font-size-xs;
  font-weight: 600;
  color: $color-bg;
  background-color: $color-primary;
  border-radius: 20rpx;
}
</style>
