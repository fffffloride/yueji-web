<template>
  <view class="invite card">
    <view class="invite__head">
      <text class="invite__title">{{ info.title }}</text>
      <view class="invite__detail" @click="emit('detail')">
        <text>{{ info.detailText }}</text>
        <wd-icon name="chevron-right" size="24rpx" />
      </view>
    </view>

    <view class="invite__banner">
      <view class="invite__banner-body">
        <view class="invite__brand">
          <YjLogo :size="28" />
          <text class="invite__brand-name">悦己DLumière</text>
        </view>
        <text class="invite__banner-text">{{ info.bannerText }}</text>
      </view>
      <view class="invite__badge">{{ info.participantsText }}</view>
      <view class="invite__line" />
    </view>

    <view class="invite__foot">
      <view v-for="stat in info.stats" :key="stat.label" class="invite__stat">
        <text class="invite__stat-value">
          {{ stat.isMoney ? formatPrice(stat.value, true) : stat.value }}
        </text>
        <text class="invite__stat-label">{{ stat.label }}</text>
      </view>
      <view class="invite__button" @click="emit('invite')">{{ info.buttonText }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { InviteInfo } from "@/mocks/mine";
import { formatPrice } from "@/utils/format";

defineProps<{ info: InviteInfo }>();

const emit = defineEmits<{
  (e: "detail"): void;
  (e: "invite"): void;
}>();
</script>

<style lang="scss" scoped>
.invite__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: $spacing-sm;
}

.invite__title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: $color-text-title;
}

.invite__detail {
  display: flex;
  gap: $spacing-xs;
  align-items: center;
  font-size: $font-size-sm;
  color: $color-text-placeholder;
}

.invite__banner {
  position: relative;
  height: 220rpx;
  margin-bottom: $spacing-sm;
  overflow: hidden;
  background: $color-surface-rose;
  border-radius: 32rpx;
}

.invite__banner-body {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  justify-content: center;
  padding: 32rpx;
}

.invite__brand {
  display: flex;
  gap: $spacing-xs;
  align-items: center;
}

.invite__brand-name {
  font-size: 20rpx; // 设计稿 10px
  font-weight: 700;
  color: $color-text-title;
}

.invite__banner-text {
  font-size: 40rpx; // 设计稿 text-xl
  font-weight: 900;
  color: $color-text-title;
}

.invite__badge {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  padding: 8rpx 16rpx;
  font-size: 18rpx; // 设计稿 9px
  font-weight: 700;
  color: $color-bg;
  background: $color-price;
  border-radius: 0 16rpx;
}

.invite__line {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 4rpx;
  background: $color-primary;
}

.invite__foot {
  display: flex;
  gap: $spacing-sm;
  align-items: center;
}

.invite__stat {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.invite__stat-value {
  font-size: $font-size-lg;
  font-weight: 700;
  color: $color-text-title;
}

.invite__stat-label {
  font-size: $font-size-sm;
  color: $color-text-placeholder;
}

.invite__button {
  padding: 20rpx 32rpx;
  font-size: $font-size-md;
  font-weight: 700;
  color: $color-bg;
  background: $color-text-title;
  border-radius: $radius-button;
}
</style>
