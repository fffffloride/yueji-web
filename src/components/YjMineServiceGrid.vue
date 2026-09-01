<template>
  <view class="service-list card">
    <view
      v-for="(item, index) in items"
      :key="item.label"
      class="service-list__item"
      @click="emit('select', index)"
    >
      <text class="service-list__label">{{ item.label }}</text>
      <wd-icon
        name="chevron-right"
        size="28rpx"
        color="var(--yj-color-text-placeholder, #999)"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import type { ServiceEntry } from "@/mocks/mine";

defineProps<{ items: ServiceEntry[] }>();

const emit = defineEmits<{
  (e: "select", index: number): void;
}>();
</script>

<style lang="scss" scoped>
.service-list {
  padding: 0 $spacing-md;
  color: $color-text-title;
}

.service-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: $height-list-item;
  border-bottom: 2rpx solid $color-line;

  &:last-child {
    border-bottom: 0;
  }
}

.service-list__label {
  font-size: $font-size-md;
  color: $color-text-title;
}
</style>
