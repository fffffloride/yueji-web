<template>
  <view class="yj-trust-bar">
    <view class="yj-trust-bar__brand">
      <YjLogo :size="28" />
      <text class="yj-trust-bar__brand-name">悦己DLumière</text>
    </view>
    <swiper
      class="yj-trust-bar__viewport"
      vertical
      :circular="props.items.length > 1"
      :autoplay="props.items.length > 1"
      :interval="5000"
      :duration="400"
    >
      <swiper-item v-for="item in props.items" :key="item">
        <view class="yj-trust-bar__item">{{ item }}</view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{
  items: string[];
}>();
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
  height: 40rpx;
  overflow: hidden;
}

.yj-trust-bar__item {
  height: 40rpx;
  overflow: hidden;
  font-size: $font-size-xs;
  line-height: 40rpx;
  color: $color-text-sub;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
