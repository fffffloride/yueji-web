<template>
  <view class="yj-placeholder card">
    <view class="yj-placeholder__title">{{ title }}</view>
    <view v-if="section" class="yj-placeholder__section">需求文档 {{ section }}</view>
    <view v-if="points?.length" class="yj-placeholder__list">
      <view v-for="point in points" :key="point" class="yj-placeholder__item">· {{ point }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 页面占位说明块。
 *
 * 脚手架阶段各业务页只有路由与骨架，用它标注该页对应的需求条目，
 * 页面开始实现后直接删除即可。
 */
defineProps<{
  title: string;
  /** 需求文档中的章节号，如 3.2.5 */
  section?: string;
  /** 该页待实现的要点 */
  points?: string[];
}>();
</script>

<style lang="scss" scoped>
.yj-placeholder__title {
  font-size: $font-size-lg;
  font-weight: 500;
  color: $color-text-title;
}

.yj-placeholder__section {
  margin-top: $spacing-xs;
  font-size: $font-size-sm;
  color: $color-primary;
}

.yj-placeholder__list {
  margin-top: $spacing-md;
}

.yj-placeholder__item {
  margin-bottom: $spacing-xs;
  font-size: $font-size-sm;
  line-height: 1.6;
  color: $color-text-sub;
}
</style>
