<template>
  <view class="product-card" @click="handleClick">
    <image class="product-card__cover" :src="product.cover" mode="aspectFill" lazy-load />
    <view class="product-card__body">
      <view class="product-card__name">{{ product.name }}</view>
      <view v-if="product.tags.length" class="product-card__tags">
        <wd-tag v-for="tag in product.tags" :key="tag" type="primary" plain custom-class="mr-1">
          {{ tag }}
        </wd-tag>
      </view>
      <view class="product-card__bottom">
        <view class="product-card__price">
          <text class="product-card__price-now">{{ formatPrice(product.price, true) }}</text>
          <text
            v-if="product.originalPrice > product.price"
            class="product-card__price-origin"
          >
            {{ formatPrice(product.originalPrice, true) }}
          </text>
        </view>
        <text class="product-card__sales">已售{{ product.sales }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { ProductItem } from "@/api/product";
import { RoutePath } from "@/constants";
import { formatPrice } from "@/utils/format";
import { navigate } from "@/utils/navigate";

const props = defineProps<{ product: ProductItem }>();

function handleClick(): void {
  navigate(RoutePath.PRODUCT_DETAIL, { params: { id: props.product.id } });
}
</script>

<style lang="scss" scoped>
.product-card {
  display: flex;
  padding: 20rpx;
  margin-bottom: 20rpx;
  background: #fff;
  border-radius: 16rpx;

  &__cover {
    flex-shrink: 0;
    width: 180rpx;
    height: 180rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
  }

  &__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    margin-left: 20rpx;
  }

  &__name {
    display: -webkit-box;
    overflow: hidden;
    font-size: 28rpx;
    font-weight: 500;
    line-height: 1.4;
    color: #333;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  &__tags {
    margin-top: 8rpx;
  }

  &__bottom {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-top: auto;
  }

  &__price-now {
    font-size: 32rpx;
    font-weight: 600;
    color: #c94f4f;
  }

  &__price-origin {
    margin-left: 12rpx;
    font-size: 24rpx;
    color: #999;
    text-decoration: line-through;
  }

  &__sales {
    font-size: 22rpx;
    color: #999;
  }
}
</style>
