<template>
  <view class="yj-trust-bar">
    <view class="yj-trust-bar__brand">
      <YjLogo :size="28" />
      <text class="yj-trust-bar__brand-name">悦己DLumière</text>
    </view>
    <view class="yj-trust-bar__viewport">
      <view class="yj-trust-bar__track">
        <text
          v-for="(item, index) in duplicatedItems"
          :key="index"
          class="yj-trust-bar__item"
        >
          {{ item }}
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/** 滚动信任条：品牌名 + 无缝横向滚动文案（双份列表 + translateX 循环）。 */
const props = defineProps<{
  items: string[];
}>();

const duplicatedItems = computed(() => [...props.items, ...props.items]);
</script>

<style lang="scss" scoped>
.yj-trust-bar {
  display: flex;
  gap: $spacing-sm;
  align-items: center;
  padding: 12rpx $spacing-md;
  overflow: hidden;
  background-color: $color-bg;

  @include hairline(bottom);
}

.yj-trust-bar__brand {
  display: flex;
  flex-shrink: 0;
  gap: $spacing-xs;
  align-items: center;
}

.yj-trust-bar__brand-name {
  font-size: $font-size-xs;
  font-weight: bold;
  color: $color-text-title;
  letter-spacing: 1rpx;
}

.yj-trust-bar__viewport {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.yj-trust-bar__track {
  display: inline-flex;
  white-space: nowrap;
  animation: yj-trust-bar-scroll 20s linear infinite;
}

.yj-trust-bar__item {
  padding-right: 80rpx;
  font-size: $font-size-xs;
  color: $color-text-sub;
}

@keyframes yj-trust-bar-scroll {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}
</style>
