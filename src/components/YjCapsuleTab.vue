<template>
  <scroll-view class="yj-capsule" scroll-x :show-scrollbar="false">
    <view
      v-for="(tab, index) in tabs"
      :key="tab"
      class="yj-capsule__item"
      :class="{ 'yj-capsule__item--active': index === modelValue }"
      @click="handleSelect(index)"
    >
      {{ tab }}
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
/** 胶囊 Tab：可横向滚动，选中项黑底白字。 */
const props = defineProps<{
  tabs: string[];
  modelValue: number;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", index: number): void;
}>();

function handleSelect(index: number) {
  if (index === props.modelValue) return;
  emit("update:modelValue", index);
}
</script>

<style lang="scss" scoped>
.yj-capsule {
  display: flex;
  white-space: nowrap;
}

.yj-capsule__item {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  padding: 8rpx $spacing-md;
  margin-right: $spacing-sm;
  font-size: $font-size-sm;
  color: $color-text-sub;
  background-color: $color-bg-page;
  border-radius: 20rpx;

  &:last-child {
    margin-right: 0;
  }
}

.yj-capsule__item--active {
  font-weight: 500;
  color: $color-bg;
  background-color: $color-text-title;
}
</style>
