<template>
  <view class="product-card" @click="handleClick">
    <image
      v-if="product.cover && !imageFailed"
      class="product-card__cover"
      :src="product.cover"
      mode="aspectFill"
      lazy-load
      @error="imageFailed = true"
    />
    <view v-else class="product-card__cover product-card__cover--empty">悦己</view>
    <view class="product-card__body">
      <view class="product-card__name">{{ product.name }}</view>
      <view v-if="product.subTitle" class="product-card__subtitle">{{ product.subTitle }}</view>
      <view class="product-card__meta">
        <text>已售{{ product.sales }}</text>
        <text v-if="product.painFriendly" class="product-card__friendly">♥ 疼痛友好</text>
      </view>
      <view class="product-card__bottom">
        <view class="product-card__price">
          <text class="product-card__price-now">{{ compactPrice(product.price) }}</text>
          <text class="product-card__price-suffix">起</text>
        </view>
        <text v-if="discount > 0" class="product-card__discount">
          优惠{{ compactPrice(discount, false) }}
        </text>
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
const imageFailed = ref(false);
const discount = computed(() => Math.max(0, props.product.originalPrice - props.product.price));

function compactPrice(cents: number, withSymbol = true): string {
  return formatPrice(cents, withSymbol).replace(/\.00$/, "");
}

function handleClick(): void {
  navigate(RoutePath.PRODUCT_DETAIL, { params: { id: props.product.id } });
}

watch(
  () => props.product.cover,
  () => {
    imageFailed.value = false;
  }
);
</script>

<style lang="scss" scoped>
.product-card {
  display: flex;
  padding: 16rpx 0;
  margin-bottom: 12rpx;
  background: #fff;

  &__cover {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 200rpx;
    height: 180rpx;
    font-size: $font-size-sm;
    color: $color-text-placeholder;
    background: $color-bg-page;

    &--empty {
      letter-spacing: 4rpx;
    }
  }

  &__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    margin-left: 22rpx;
  }

  &__name {
    min-width: 0;
    font-size: 30rpx;
    font-weight: 600;
    color: $color-text-title;

    @include ellipsis;
  }

  &__subtitle {
    margin-top: 8rpx;
    font-size: 25rpx;
    color: $color-primary;

    @include ellipsis;
  }

  &__meta {
    display: flex;
    align-items: center;
    min-width: 0;
    margin-top: 8rpx;
    font-size: $font-size-sm;
    color: $color-text-sub;
  }

  &__friendly {
    padding: 2rpx 8rpx;
    margin-left: 12rpx;
    color: $color-primary;
    background: rgb(45 90 61 / 8%);
  }

  &__bottom {
    display: flex;
    align-items: center;
    margin-top: auto;
  }

  &__price-now {
    font-size: 36rpx;
    font-weight: 600;
    color: $color-primary-light;
  }

  &__price-suffix {
    margin-left: 4rpx;
    font-size: $font-size-xs;
    color: $color-primary-light;
  }

  &__discount {
    padding: 4rpx 8rpx;
    margin-left: 14rpx;
    font-size: $font-size-sm;
    color: $color-primary-light;
    border: 2rpx solid $color-primary-lighter;
  }
}
</style>
