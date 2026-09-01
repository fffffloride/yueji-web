<template>
  <view class="yj-coupon-card" :class="{ 'yj-coupon-card--muted': muted }">
    <view class="yj-coupon-card__value">
      <view class="yj-coupon-card__value-main">
        <text v-if="valuePrefix" class="yj-coupon-card__prefix">{{ valuePrefix }}</text>
        <text class="yj-coupon-card__number">{{ value }}</text>
        <text v-if="valueSuffix" class="yj-coupon-card__suffix">{{ valueSuffix }}</text>
      </view>
      <text class="yj-coupon-card__condition">{{ condition }}</text>
    </view>

    <view class="yj-coupon-card__content">
      <view class="yj-coupon-card__heading">
        <text class="yj-coupon-card__name">{{ name }}</text>
        <text class="yj-coupon-card__type">{{ typeLabel }}</text>
      </view>
      <text class="yj-coupon-card__scope">{{ scopeLabel }}</text>
      <text class="yj-coupon-card__date">{{ validRange }}</text>
    </view>

    <view
      class="yj-coupon-card__action"
      :class="{ 'yj-coupon-card__action--disabled': actionDisabled }"
      @click.stop="emit('action')"
    >
      {{ actionLabel }}
    </view>
  </view>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    value: string;
    valuePrefix?: string;
    valueSuffix?: string;
    condition: string;
    name: string;
    typeLabel: string;
    scopeLabel: string;
    validRange: string;
    actionLabel: string;
    actionDisabled?: boolean;
    muted?: boolean;
  }>(),
  {
    valuePrefix: "",
    valueSuffix: "",
    actionDisabled: false,
    muted: false,
  }
);

const emit = defineEmits<{
  (e: "action"): void;
}>();
</script>

<style lang="scss" scoped>
.yj-coupon-card {
  position: relative;
  display: flex;
  min-height: 220rpx;
  overflow: hidden;
  background: $color-bg;
  border: 2rpx solid $color-line;
  border-radius: $radius-card;
  box-shadow: 0 8rpx 28rpx rgb(0 0 0 / 4%);

  &::before,
  &::after {
    position: absolute;
    left: 218rpx;
    z-index: 1;
    width: 28rpx;
    height: 28rpx;
    content: "";
    background: $color-bg-page;
    border: 2rpx solid $color-line;
    border-radius: 50%;
    transform: translateX(-50%);
  }

  &::before {
    top: -16rpx;
  }

  &::after {
    bottom: -16rpx;
  }
}

.yj-coupon-card__value {
  display: flex;
  flex: 0 0 218rpx;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-md $spacing-sm;
  color: $color-primary-dark;
  background: $color-primary-tint;
  border-right: 2rpx dashed $color-border;
}

.yj-coupon-card__value-main {
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.yj-coupon-card__prefix,
.yj-coupon-card__suffix {
  font-size: $font-size-sm;
  font-weight: 600;
}

.yj-coupon-card__number {
  max-width: 150rpx;
  overflow: hidden;
  font-size: 56rpx;
  font-weight: 700;
  line-height: 1.15;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.yj-coupon-card__condition {
  margin-top: $spacing-xs;
  font-size: $font-size-xs;
  color: $color-primary;
  text-align: center;
}

.yj-coupon-card__content {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding: $spacing-md 138rpx $spacing-md $spacing-md;
}

.yj-coupon-card__heading {
  display: flex;
  gap: $spacing-xs;
  align-items: center;
}

.yj-coupon-card__name {
  min-width: 0;
  overflow: hidden;
  font-size: $font-size-md;
  font-weight: 600;
  color: $color-text-title;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.yj-coupon-card__type {
  flex-shrink: 0;
  padding: 2rpx 10rpx;
  font-size: 20rpx;
  color: $color-primary;
  background: $color-primary-tint;
  border-radius: $radius-tag;
}

.yj-coupon-card__scope,
.yj-coupon-card__date {
  margin-top: $spacing-xs;
  overflow: hidden;
  font-size: $font-size-xs;
  color: $color-text-sub;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.yj-coupon-card__date {
  color: $color-text-placeholder;
}

.yj-coupon-card__action {
  position: absolute;
  top: 50%;
  right: $spacing-md;
  min-width: 104rpx;
  padding: 12rpx 18rpx;
  font-size: $font-size-sm;
  font-weight: 600;
  color: $color-bg;
  text-align: center;
  background: $color-primary-dark;
  border-radius: $radius-button;
  transform: translateY(-50%);
}

.yj-coupon-card__action--disabled {
  color: $color-text-placeholder;
  pointer-events: none;
  background: $color-bg-page;
  border: 2rpx solid $color-line;
}

.yj-coupon-card--muted {
  box-shadow: none;

  .yj-coupon-card__value {
    color: $color-text-placeholder;
    background: $color-bg-page;
  }

  .yj-coupon-card__condition,
  .yj-coupon-card__name,
  .yj-coupon-card__type {
    color: $color-text-placeholder;
  }

  .yj-coupon-card__type {
    background: $color-bg-page;
  }
}
</style>
