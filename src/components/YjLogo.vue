<template>
  <view class="yj-logo">
    <view class="yj-logo__dot yj-logo__dot--lg" :style="dotStyle(size)" />
    <view class="yj-logo__dot yj-logo__dot--md" :style="dotStyle(size * 0.8)" />
    <view class="yj-logo__dot yj-logo__dot--sm" :style="dotStyle(size * 0.5)" />
  </view>
</template>

<script setup lang="ts">
/** 品牌 Logo：三个纯 CSS 圆点，等比 1 : 0.8 : 0.5。 */
withDefaults(
  defineProps<{
    /** 大圆点直径（rpx） */
    size?: number;
  }>(),
  { size: 44 }
);

/** 圆点尺寸，用内联样式避免小程序端 CSS v-bind 兼容问题。 */
function dotStyle(diameter: number) {
  return { width: `${diameter}rpx`, height: `${diameter}rpx` };
}
</script>

<style lang="scss" scoped>
.yj-logo {
  display: flex;
  gap: 6rpx;
  align-items: flex-end;
}

.yj-logo__dot {
  border-radius: 50%;
}

.yj-logo__dot--lg {
  background-color: $color-text-title;
}

.yj-logo__dot--md {
  background-color: $color-text-content;
}

.yj-logo__dot--sm {
  background-color: $color-primary;
}
</style>
