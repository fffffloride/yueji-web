<template>
  <view class="community card">
    <view class="community__body">
      <text class="community__title">{{ info.title }}</text>
      <text class="community__sub">{{ info.sub }}</text>
    </view>
    <view class="community__qr" @longpress="emit('longpress')">
      <wd-icon name="qrcode" size="80rpx" />
    </view>
  </view>
</template>

<script setup lang="ts">
import type { CommunityInfo } from "@/mocks/mine";

defineProps<{ info: CommunityInfo }>();

const emit = defineEmits<{
  (e: "longpress"): void;
}>();
</script>

<style lang="scss" scoped>
.community {
  display: flex;
  gap: $spacing-md;
  align-items: center;
}

.community__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: $spacing-xs;
}

.community__title {
  font-size: $font-size-md;
  font-weight: 600;
  color: $color-text-title;
}

.community__sub {
  font-size: $font-size-sm;
  color: $color-text-sub;
}

.community__qr {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 128rpx;
  height: 128rpx;
  color: $color-text-content;
  background: $color-bg-page;
  border: 2rpx solid $color-border;
  border-radius: $radius-card;
}
</style>
