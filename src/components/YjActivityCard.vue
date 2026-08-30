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
  display: flex;
  flex-direction: column;
  padding: 20rpx;
  overflow: hidden;
  border-radius: 24rpx;
}

.yj-activity__head {
  display: flex;
  gap: $spacing-xs;
  align-items: center;
}

.yj-activity__title {
  font-size: $font-size-sm;
  font-weight: bold;
  color: $color-text-title;
}

.yj-activity__badge {
  padding: 2rpx 8rpx;
  font-size: 18rpx;
  font-weight: bold;
  color: $color-bg;
  background-color: $color-price;
  border-radius: 6rpx;
}

.yj-activity__sub {
  margin-top: $spacing-xs;
  font-size: $font-size-xs;
  line-height: 1.6;
  color: $color-text-sub;
  white-space: pre-line;
}

.yj-activity__foot {
  position: absolute;
  right: 20rpx;
  bottom: 16rpx;
  left: 20rpx;
  font-size: 16rpx;
  color: $color-text-placeholder;
}
</style>
