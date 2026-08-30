<template>
  <view class="group card">
    <view class="group__title">{{ group.title }}</view>
    <view class="group__panel">
      <view class="group__row">
        <view class="group__icon">
          <wd-icon name="heart-filled" size="32rpx" color="var(--yj-color-bg, #fff)" />
        </view>
        <view class="group__intro">
          <text class="group__desc">{{ group.desc }}</text>
          <text class="group__sub">{{ group.sub }}</text>
        </view>
        <view class="group__join" @click="emit('join')">{{ group.joinText }}</view>
      </view>
      <view class="group__benefits">
        <view v-for="benefit in group.benefits" :key="benefit" class="group__benefit">
          <wd-icon name="check-bold" size="24rpx" color="var(--yj-color-primary, #2d5a3d)" />
          <text>{{ benefit }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { ServiceGroup } from "@/mocks/mine";

defineProps<{ group: ServiceGroup }>();

const emit = defineEmits<{
  (e: "join"): void;
}>();
</script>

<style lang="scss" scoped>
.group__title {
  padding-bottom: $spacing-sm;
  font-size: $font-size-lg;
  font-weight: 600;
  color: $color-text-title;
}

.group__panel {
  padding: $spacing-lg;
  background: $color-primary-tint;
  border-radius: 32rpx;
}

.group__row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.group__icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  background: $color-primary;
  border-radius: 50%;
}

.group__intro {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: $spacing-xs;
  margin: 0 $spacing-sm;
}

.group__desc {
  font-size: $font-size-md;
  font-weight: 700;
  color: $color-text-title;
}

.group__sub {
  font-size: $font-size-sm;
  color: $color-text-sub;
}

.group__join {
  flex-shrink: 0;
  padding: 16rpx 24rpx;
  font-size: $font-size-md;
  font-weight: 700;
  color: $color-bg;
  background: $color-text-title;
  border-radius: $radius-button;
}

.group__benefits {
  display: flex;
  flex-wrap: wrap;
}

.group__benefit {
  display: flex;
  gap: $spacing-xs;
  align-items: center;
  width: 50%;
  margin-top: $spacing-md;
  font-size: $font-size-sm;
  color: $color-text-sub;
}
</style>
