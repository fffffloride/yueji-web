<template>
  <view class="mine-member">
    <!-- Hero：浅灰渐变 + 水泡装饰 -->
    <view class="mine-member__hero">
      <view
        v-for="(bubble, index) in bubbles"
        :key="index"
        class="mine-member__bubble"
        :style="{
          width: `${bubble.w}rpx`,
          height: `${bubble.h}rpx`,
          top: `${bubble.t}rpx`,
          left: bubble.l !== undefined ? `${bubble.l}rpx` : undefined,
          right: bubble.r !== undefined ? `${bubble.r}rpx` : undefined,
          opacity: bubble.o,
        }"
      />
      <view class="mine-member__nav">
        <view class="mine-member__consult" @click="emit('consult')">
          <wd-icon name="chat" size="24rpx" />
          <text>咨询/预约</text>
        </view>
        <view class="mine-member__actions">
          <view class="mine-member__action-btn" @click="emit('more')">
            <wd-icon name="ellipsis" size="32rpx" />
          </view>
          <view class="mine-member__action-btn" @click="emit('scan')">
            <wd-icon name="scan" size="32rpx" />
          </view>
        </view>
      </view>
    </view>

    <!-- 会员卡 -->
    <view class="mine-member__card">
      <view class="mine-member__profile" @click="handleProfileClick">
        <view class="mine-member__nickname">{{ loggedIn ? `Hi，${nickname}` : "Hi，请登录" }}</view>
        <view class="mine-member__welcome">welcome back</view>
      </view>

      <!-- 会员进度 -->
      <view class="mine-member__progress" @click="emit('unlock')">
        <view class="mine-member__progress-row">
          <view class="mine-member__level">
            <text
              v-for="line in member.levelName.split(' ')"
              :key="line"
              class="mine-member__level-line"
            >
              {{ line }}
            </text>
          </view>
          <view class="mine-member__track">
            <view class="mine-member__fill" :style="{ width: `${member.progress}%` }" />
          </view>
        </view>
        <view class="mine-member__lock">
          <text>Lock待解锁{{ member.lockedText }}</text>
          <wd-icon name="chevron-right" size="24rpx" />
        </view>
      </view>

      <!-- 统计 -->
      <view class="mine-member__stats">
        <view
          v-for="(stat, index) in member.stats"
          :key="stat.label"
          class="mine-member__stat"
          @click="emit('stat', index)"
        >
          <text class="mine-member__stat-value">{{ !loggedIn ? "—" : stat.count }}</text>
          <text class="mine-member__stat-label">{{ stat.label }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { MemberInfo } from "@/mocks/mine";

const props = withDefaults(
  defineProps<{
    member: MemberInfo;
    nickname: string;
    loggedIn?: boolean;
  }>(),
  { loggedIn: false }
);

const emit = defineEmits<{
  (e: "consult"): void;
  (e: "more"): void;
  (e: "scan"): void;
  (e: "login"): void;
  (e: "member"): void;
  (e: "unlock"): void;
  (e: "stat", index: number): void;
}>();

/** 水泡装饰位置（设计稿 px 已换算为 rpx）。 */
interface BubbleStyle {
  w: number;
  h: number;
  t: number;
  l?: number;
  r?: number;
  o: number;
}

const bubbles: BubbleStyle[] = [
  { w: 220, h: 220, t: -40, l: -40, o: 0.35 },
  { w: 160, h: 160, t: 20, l: 100, o: 0.2 },
  { w: 120, h: 120, t: -20, r: 80, o: 0.25 },
  { w: 180, h: 180, t: 60, r: -40, o: 0.3 },
];

/** 未登录点昵称区走登录，已登录进会员中心。 */
function handleProfileClick() {
  if (props.loggedIn) {
    emit("member");
  } else {
    emit("login");
  }
}
</script>

<style lang="scss" scoped>
.mine-member__hero {
  position: relative;
  height: 280rpx;
  overflow: hidden;
  background: linear-gradient(160deg, $color-surface-gray 0%, $color-surface-gray-light 100%);
}

.mine-member__bubble {
  position: absolute;
  background: radial-gradient(circle at 35% 35%, rgb(255 255 255 / 50%), transparent 70%);
  border: 2rpx solid rgb(255 255 255 / 60%);
  border-radius: 50%;
}

.mine-member__nav {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx 0;
}

.mine-member__consult {
  display: flex;
  gap: $spacing-xs;
  align-items: center;
  padding: 12rpx 24rpx;
  font-size: $font-size-sm;
  color: $color-text-content;
  background: rgb(255 255 255 / 80%);
  border-radius: $radius-button;
  box-shadow: 0 2rpx 8rpx rgb(0 0 0 / 6%);
}

.mine-member__actions {
  display: flex;
  gap: $spacing-sm;
}

.mine-member__action-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56rpx;
  height: 56rpx;
  color: $color-text-content;
  background: rgb(255 255 255 / 80%);
  border-radius: 50%;
  box-shadow: 0 2rpx 8rpx rgb(0 0 0 / 6%);
}

// 视觉保持 56rpx，点击区扩到 88rpx（小程序点击舒适最小值）
.mine-member__action-btn::after {
  position: absolute;
  inset: -16rpx;
  content: "";
}

.mine-member__card {
  position: relative;
  padding: 40rpx 40rpx 0;
  margin: -80rpx 24rpx 0;
  overflow: hidden;

  @include card;
}

.mine-member__nickname {
  font-size: 48rpx; // 设计稿 text-2xl，超过最大字体档位，按设计取值
  font-weight: 700;
  color: $color-text-title;
}

.mine-member__welcome {
  margin-bottom: $spacing-lg;
  font-size: $font-size-md;
  color: $color-text-placeholder;
}

.mine-member__progress {
  margin-bottom: $spacing-sm;
  background: $color-primary-tint;
  border-radius: 24rpx;
}

.mine-member__progress-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 24rpx;
}

.mine-member__level {
  display: flex;
  flex-direction: column;
}

.mine-member__level-line {
  font-size: 20rpx; // 设计稿 10px
  font-weight: 700;
  line-height: 1.2;
  color: $color-text-title;
}

.mine-member__track {
  flex: 1;
  height: 24rpx;
  margin-left: 24rpx;
  overflow: hidden;
  background: rgb(255 255 255 / 60%);
  border-radius: 24rpx;
}

.mine-member__fill {
  height: 100%;
  background: linear-gradient(to right, $color-primary-lighter, $color-primary);
  border-radius: 24rpx;
}

.mine-member__lock {
  display: flex;
  gap: $spacing-xs;
  align-items: center;
  justify-content: flex-end;
  padding: 0 24rpx 16rpx;
  font-size: $font-size-sm;
  color: $color-text-sub;
}

.mine-member__stats {
  display: flex;
  padding: $spacing-lg 0;
  margin-top: $spacing-lg;
  border-top: 2rpx solid $color-line;
}

.mine-member__stat {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: $spacing-xs;
  align-items: center;
}

.mine-member__stat-value {
  font-size: 40rpx; // 设计稿 text-xl
  font-weight: 600;
  color: $color-text-title;
}

.mine-member__stat-label {
  font-size: $font-size-sm;
  color: $color-text-sub;
}
</style>
