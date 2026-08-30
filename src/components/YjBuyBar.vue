<template>
  <view class="yj-buybar">
    <view class="yj-buybar__consult" @click="emit('consult')">
      <wd-icon name="chat" size="36rpx" />
      <text class="yj-buybar__consult-text">咨询/预约</text>
    </view>
    <view class="yj-buybar__button" @click="emit('buy')">{{ label }}</view>
  </view>
</template>

<script setup lang="ts">
/** 底部购买栏：咨询入口 + 主购买按钮，放在 YjPage 的 footer 插槽中使用。 */
withDefaults(
  defineProps<{
    /** 主按钮文案 */
    label?: string;
  }>(),
  { label: "立即购买" }
);

const emit = defineEmits<{
  (e: "buy"): void;
  (e: "consult"): void;
}>();
</script>

<style lang="scss" scoped>
.yj-buybar {
  display: flex;
  gap: $spacing-md;
  align-items: center;
}

.yj-buybar__consult {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
  color: $color-text-sub;
}

.yj-buybar__consult-text {
  margin-top: 4rpx;
  font-size: 20rpx;
}

.yj-buybar__button {
  flex: 1;
  height: $height-button;
  font-size: $font-size-lg;
  font-weight: bold;
  line-height: $height-button;
  color: $color-bg;
  text-align: center;
  letter-spacing: 2rpx;
  background-color: $color-primary;
  border-radius: 32rpx;
}
</style>
