<template>
  <view class="yj-activity" :style="{ background: card.bg }" @click="emit('click')">
    <view class="yj-activity__head">
      <text class="yj-activity__title">{{ card.title }}</text>
      <text v-if="card.badge" class="yj-activity__badge">{{ card.badge }}</text>
    </view>
    <text class="yj-activity__sub">{{ card.sub }}</text>
    <text class="yj-activity__foot">悦己 · 由专业而美</text>
  </view>
</template>

<script setup lang="ts">
/** 活动宫格卡片：2×2 宫格中的单项，渐变底占位图后续替换为真实素材。 */
defineProps<{
  card: {
    title: string;
    sub: string;
    /** 背景色，取 CSS 自定义属性 */
    bg: string;
    badge?: string;
  };
}>();

const emit = defineEmits<{
  (e: "click"): void;
}>();
</script>

<style lang="scss" scoped>
.yj-activity {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 184rpx;
  padding: 20rpx 20rpx 54rpx;
  overflow: hidden;
  border: 1rpx solid $color-line;
  border-radius: 24rpx;
}

.yj-activity__head {
  display: flex;
  gap: $spacing-xs;
  align-items: center;
  min-width: 0;
}

.yj-activity__title {
  min-width: 0;
  overflow: hidden;
  font-size: $font-size-sm;
  font-weight: bold;
  color: $color-primary-dark;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.yj-activity__badge {
  flex-shrink: 0;
  padding: 2rpx 8rpx;
  font-size: 18rpx;
  font-weight: bold;
  color: $color-bg;
  background-color: $color-primary-lighter;
  border-radius: 6rpx;
}

.yj-activity__sub {
  display: -webkit-box;
  margin-top: $spacing-xs;
  overflow: hidden;
  font-size: $font-size-xs;
  line-height: 1.6;
  color: $color-text-sub;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  white-space: pre-line;
}

.yj-activity__foot {
  position: absolute;
  right: 20rpx;
  bottom: 16rpx;
  left: 20rpx;
  overflow: hidden;
  font-size: 16rpx;
  line-height: 1.2;
  color: $color-primary-light;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
