<template>
  <view class="yj-quick card">
    <view v-if="title" class="yj-quick__title">{{ title }}</view>
    <view class="yj-quick__grid">
      <view
        v-for="(item, index) in items"
        :key="item.label"
        class="yj-quick__item"
        @click="emit('click', index)"
      >
        <wd-icon v-if="item.icon" :name="item.icon" size="36rpx" />
        <text v-else class="yj-quick__value">{{ item.value }}</text>
        <text class="yj-quick__label">{{ item.label }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/** 快捷入口：数值/图标 + 标签的横向宫格。 */
defineProps<{
  /** 卡片标题，如「你好，悦己用户」，可不传 */
  title?: string;
  items: {
    label: string;
    value?: string;
    /** wd-icon 图标名，有图标时优先展示图标 */
    icon?: string;
  }[];
}>();

const emit = defineEmits<{
  (e: "click", index: number): void;
}>();
</script>

<style lang="scss" scoped>
.yj-quick__title {
  margin-bottom: $spacing-md;
  font-size: $font-size-lg;
  font-weight: 500;
  color: $color-text-title;
}

.yj-quick__grid {
  display: flex;
  justify-content: space-between;
}

.yj-quick__item {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: $spacing-xs;
  align-items: center;
}

.yj-quick__value {
  font-size: $font-size-lg;
  font-weight: 600;
  color: $color-text-title;
}

.yj-quick__label {
  font-size: $font-size-sm;
  color: $color-text-sub;
}
</style>
