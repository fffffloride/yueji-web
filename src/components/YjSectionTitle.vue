<template>
  <view class="yj-section-title">
    <text class="yj-section-title__text">{{ title }}</text>
    <view v-if="showMore" class="yj-section-title__more" @click="emit('more')">
      {{ moreText }}
      <wd-icon name="arrow-right" size="20rpx" />
    </view>
  </view>
</template>

<script setup lang="ts">
/** 区块标题：左侧标题 + 可选「查看更多」。 */
withDefaults(
  defineProps<{
    title: string;
    showMore?: boolean;
    moreText?: string;
  }>(),
  { showMore: false, moreText: "查看更多" }
);

const emit = defineEmits<{
  (e: "more"): void;
}>();
</script>

<style lang="scss" scoped>
.yj-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.yj-section-title__text {
  font-size: $font-size-md;
  font-weight: bold;
  color: $color-text-title;
}

.yj-section-title__more {
  display: flex;
  gap: $spacing-xs;
  align-items: center;
  font-size: $font-size-xs;
  color: $color-text-placeholder;
}
</style>
