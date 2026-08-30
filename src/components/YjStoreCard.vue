<template>
  <view class="yj-store" @click="emit('click')">
    <view v-if="cover" class="yj-store__cover">
      <view class="yj-store__cover-tag">了解门店<wd-icon name="arrow-right" size="20rpx" /></view>
    </view>
    <view class="yj-store__name">{{ name }}</view>
    <view class="yj-store__meta">
      <text class="yj-store__address">{{ address }}</text>
      <text v-if="meta" class="yj-store__tag">{{ meta }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
/** 门店卡：可选门店大图 + 名称 + 地址 + 右侧标签（城市/距离）。 */
withDefaults(
  defineProps<{
    name: string;
    address: string;
    /** 右侧标签文案（城市名或距离） */
    meta?: string;
    /** 是否展示顶部大图占位块 */
    cover?: boolean;
  }>(),
  { meta: "", cover: false }
);

const emit = defineEmits<{
  (e: "click"): void;
}>();
</script>

<style lang="scss" scoped>
.yj-store__cover {
  position: relative;
  height: 288rpx;
  margin-bottom: $spacing-md;
  overflow: hidden;
  background: linear-gradient(135deg, $color-primary-tint, $color-surface-warm);
  border-radius: 24rpx;
}

.yj-store__cover-tag {
  position: absolute;
  right: $spacing-sm;
  bottom: $spacing-sm;
  display: flex;
  gap: $spacing-xs;
  align-items: center;
  padding: 8rpx $spacing-md;
  font-size: $font-size-xs;
  color: $color-text-title;
  background-color: rgb(255 255 255 / 90%);
  border-radius: 20rpx;
}

.yj-store__name {
  font-size: $font-size-md;
  font-weight: 500;
  color: $color-text-title;
}

.yj-store__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2rpx;
}

.yj-store__address {
  flex: 1;
  min-width: 0;
  font-size: $font-size-xs;
  color: $color-text-placeholder;

  @include ellipsis;
}

.yj-store__tag {
  flex-shrink: 0;
  padding: 2rpx 10rpx;
  margin-left: $spacing-sm;
  font-size: $font-size-xs;
  color: $color-text-placeholder;
  border: 1rpx solid $color-border;
  border-radius: 6rpx;
}
</style>
