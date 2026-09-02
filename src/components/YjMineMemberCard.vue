<template>
  <view class="mine-member">
    <!-- Hero：雾绿晨光背景 -->
    <view class="mine-member__hero">
      <view class="mine-member__nav">
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
            {{ account?.level?.name || (loggedIn ? "会员等级" : "悦己会员") }}
          </view>
          <view class="mine-member__track">
            <view class="mine-member__fill" :style="{ width: `${memberLevelProgress(account)}%` }" />
          </view>
        </view>
        <view class="mine-member__lock">
          <text>{{ account?.level?.code || "—" }}</text>
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
import type { PointsAccount } from "@/api/marketing";
import type { MemberInfo } from "@/mocks/mine";
import { memberLevelProgress } from "@/utils/member-level";

const props = withDefaults(
  defineProps<{
    member: MemberInfo;
    account?: PointsAccount | null;
    nickname: string;
    loggedIn?: boolean;
  }>(),
  { account: null, loggedIn: false }
);

const emit = defineEmits<{
  (e: "more"): void;
  (e: "scan"): void;
  (e: "login"): void;
  (e: "member"): void;
  (e: "unlock"): void;
  (e: "stat", index: number): void;
}>();

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
  height: 320rpx;
  overflow: hidden;
  background:
    radial-gradient(circle at 86% 8%, rgba($color-primary-lighter, 0.24), transparent 34%),
    linear-gradient(155deg, #dce8e0 0%, #eef4f0 58%, $color-bg-page 100%);

  &::before,
  &::after {
    position: absolute;
    content: "";
    border-radius: 50%;
  }

  &::before {
    top: -220rpx;
    left: -110rpx;
    width: 420rpx;
    height: 420rpx;
    border: 2rpx solid rgba($color-bg, 0.66);
    box-shadow: 0 0 80rpx rgba($color-bg, 0.32) inset;
  }

  &::after {
    top: -110rpx;
    right: 40rpx;
    width: 260rpx;
    height: 260rpx;
    border: 2rpx solid rgba($color-bg, 0.42);
  }
}

.mine-member__nav {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 24rpx 32rpx 0;
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
  color: $color-primary-dark;
  background: rgba($color-bg, 0.78);
  backdrop-filter: blur(12rpx);
  border: 2rpx solid rgba($color-bg, 0.82);
  border-radius: 50%;
  box-shadow: 0 8rpx 24rpx rgba($color-primary-dark, 0.08);
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
  margin: -118rpx 24rpx 0;
  overflow: hidden;
  background: rgba($color-bg, 0.94);
  backdrop-filter: blur(18rpx);
  border: 2rpx solid rgba($color-bg, 0.9);
  border-radius: 28rpx;
  box-shadow: 0 20rpx 54rpx rgba($color-primary-dark, 0.1);
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
  flex: 0 1 160rpx;
  overflow: hidden;
  font-size: $font-size-sm;
  font-weight: 600;
  color: $color-text-title;
  text-overflow: ellipsis;
  white-space: nowrap;
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
