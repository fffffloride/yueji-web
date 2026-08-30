<template>
  <view class="service-grid card">
    <view
      v-for="(item, index) in items"
      :key="item.label"
      class="service-grid__item"
      @click="emit('select', index)"
    >
      <wd-icon :name="item.icon" size="56rpx" />
      <text class="service-grid__label">{{ item.label }}</text>
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
.service-grid {
  display: flex;
  flex-wrap: wrap;
  color: $color-text-title;
}

.service-grid__item {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  align-items: center;
  width: 20%;
  padding: $spacing-sm 0;
}

.service-grid__label {
  font-size: $font-size-sm;
  color: $color-text-sub;
  text-align: center;
}
</style>
