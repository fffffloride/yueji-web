<template>
  <view class="yj-coupon">
    <view class="yj-coupon__amount">
      <text class="yj-coupon__symbol">¥</text>
      <text class="yj-coupon__value">{{ amount }}</text>
    </view>
    <view class="yj-coupon__info">
      <view class="yj-coupon__title">{{ title }}</view>
      <view class="yj-coupon__desc">
        <template v-if="loggedIn">距失效还剩 <YjCountdown :seconds="seconds" @finish="emit('finish')" /></template>
        <template v-else>新人专享！好价立减</template>
      </view>
    </view>
    <view class="yj-coupon__button" @click="emit('click')">{{ loggedIn ? "去使用" : "领取" }}</view>
  </view>
</template>

<script setup lang="ts">
/** 新人券卡：浅绿底 + 大额数字 + 倒计时/领取按钮。 */
defineProps<{
  /** 券面金额（元） */
  amount: string;
  title: string;
  /** 是否已登录：登录后显示倒计时与「去使用」 */
  loggedIn: boolean;
  /** 距失效剩余秒数 */
  seconds: number;
}>();

const emit = defineEmits<{
  (e: "click"): void;
  (e: "finish"): void;
}>();
</script>

<style lang="scss" scoped>
.yj-coupon {
  display: flex;
  gap: $spacing-md;
  align-items: center;
  padding: 24rpx $spacing-lg;
  background: linear-gradient(135deg, $color-primary-tint, $color-bg);
  border: 1rpx solid $color-line;
  border-radius: 32rpx;
}

.yj-coupon__amount {
  display: flex;
  flex-shrink: 0;
  align-items: baseline;
  color: $color-primary;
}

.yj-coupon__symbol {
  font-size: $font-size-sm;
  font-weight: bold;
}

.yj-coupon__value {
  font-size: 64rpx;
  font-weight: bold;
  line-height: 1;
}

.yj-coupon__info {
  flex: 1;
  min-width: 0;
}

.yj-coupon__title {
  font-size: $font-size-md;
  font-weight: bold;
  color: $color-text-title;
}

.yj-coupon__desc {
  margin-top: $spacing-xs;
  font-size: $font-size-xs;
  color: $color-text-sub;
}

.yj-coupon__button {
  flex-shrink: 0;
  min-width: 120rpx;
  padding: 12rpx $spacing-md;
  font-size: $font-size-sm;
  font-weight: bold;
  color: $color-bg;
  text-align: center;
  background: linear-gradient(135deg, $color-primary-light, $color-primary-dark);
  border-radius: $radius-button;
}
</style>
