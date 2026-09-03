<template>
  <view class="yj-empty" :class="{ 'yj-empty--compact': compact }">
    <template v-if="image === 'content'">
      <image class="yj-empty__image" src="/static/empty-state.png" mode="aspectFit" />
      <view class="yj-empty__text">{{ text }}</view>
      <view v-if="description" class="yj-empty__description">{{ description }}</view>
    </template>
    <wd-status-tip v-else :image="image" :tip="text" />
    <view v-if="$slots.default" class="yj-empty__action"><slot /></view>
  </view>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    /** wd-status-tip 的图片类型：search / network / content / collect / comment / halo / message / user */
    image?: string;
    text?: string;
    description?: string;
    compact?: boolean;
  }>(),
  { image: "content", text: "暂无数据", description: "", compact: false }
);
</script>

<style lang="scss" scoped>
.yj-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 360rpx;
  padding: 56rpx 32rpx;
  text-align: center;
}

.yj-empty__image {
  width: 196rpx;
  height: 196rpx;
}

.yj-empty__text {
  margin-top: 20rpx;
  font-size: 28rpx;
  line-height: 1.5;
  color: #707a74;
}

.yj-empty__description {
  max-width: 480rpx;
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 1.5;
  color: #a1aaa5;
}

.yj-empty__action {
  margin-top: 28rpx;
}

.yj-empty--compact {
  min-height: 220rpx;
  padding: 28rpx 24rpx;

  .yj-empty__image {
    width: 128rpx;
    height: 128rpx;
  }

  .yj-empty__text {
    margin-top: 12rpx;
    font-size: 24rpx;
  }
}
</style>
