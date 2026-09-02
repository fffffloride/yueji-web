<template>
  <view class="mine-member">
    <view class="mine-member__hero" />

    <view class="mine-member__main-card">
      <view class="mine-member__profile" @click="handleProfileClick">
        <view class="mine-member__nickname">{{ loggedIn ? `Hi，${nickname}` : "Hi，请登录" }}</view>
        <view class="mine-member__welcome">welcome back</view>
      </view>

      <view
        class="mine-member__identity"
        :class="`is-${tierTone}`"
        role="button"
        aria-label="进入会员中心"
        @click="emit('unlock')"
      >
        <view class="mine-member__identity-top">
          <view class="mine-member__level">
            {{ account?.level?.name || (loggedIn ? "会员等级" : "悦己会员") }}
          </view>
          <view class="mine-member__code">{{ account?.level?.code || "—" }}</view>
        </view>

        <view class="mine-member__brand">DLUMIÈRE MEMBER</view>

        <view class="mine-member__progress-summary">
          <text>本级成长进度</text>
          <text>{{ progress }}%</text>
        </view>
        <view class="mine-member__track">
          <view class="mine-member__fill" :style="{ width: `${progress}%` }" />
        </view>
      </view>
    </view>

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
</template>

<script setup lang="ts">
import type { PointsAccount } from "@/api/marketing";
import type { MemberInfo } from "@/mocks/mine";
import { memberLevelProgress, memberTierTone } from "@/utils/member-level";

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
  (e: "login"): void;
  (e: "member"): void;
  (e: "unlock"): void;
  (e: "stat", index: number): void;
}>();

const progress = computed(() => Math.round(memberLevelProgress(props.account)));
const tierTone = computed(() => memberTierTone(props.account?.level?.code));

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

.mine-member__main-card {
  position: relative;
  padding: 36rpx;
  margin: -108rpx 24rpx 0;
  background: rgba($color-bg, 0.95);
  backdrop-filter: blur(18rpx);
  border: 2rpx solid rgba($color-bg, 0.94);
  border-radius: 28rpx;
  box-shadow: 0 20rpx 54rpx rgba($color-primary-dark, 0.1);
}

.mine-member__nickname {
  overflow: hidden;
  font-size: 48rpx;
  font-weight: 700;
  color: $color-text-title;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mine-member__welcome {
  margin: 4rpx 0 28rpx;
  font-size: $font-size-md;
  color: $color-text-placeholder;
}

.mine-member__identity {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 224rpx;
  padding: 28rpx;
  overflow: hidden;
  color: #40594c;
  background: linear-gradient(140deg, #edf4ef, #dce9e0);
  border: 2rpx solid rgba($color-bg, 0.5);
  border-radius: 24rpx;
  box-shadow: 0 18rpx 36rpx rgba($color-primary-dark, 0.12);

  &::before,
  &::after {
    position: absolute;
    pointer-events: none;
    content: "";
    border: 2rpx solid currentcolor;
    border-radius: 50%;
    opacity: 0.12;
  }

  &::before {
    right: -64rpx;
    bottom: -112rpx;
    width: 250rpx;
    height: 250rpx;
  }

  &::after {
    top: -90rpx;
    right: 70rpx;
    width: 160rpx;
    height: 160rpx;
  }

  &.is-l1 {
    color: #654d3d;
    background: linear-gradient(140deg, #f5e9dd, #ead6c7);
  }

  &.is-l2 {
    color: #476479;
    background: linear-gradient(140deg, #e7f0f6, #cbdce8);
  }

  &.is-l3 {
    color: #735414;
    background: linear-gradient(140deg, #f7e6ae, #dcb959);
  }

  &.is-l4 {
    color: #ead9a6;
    background:
      radial-gradient(circle at 88% 0%, rgb(234 217 166 / 16%), transparent 34%),
      linear-gradient(140deg, #20352c, #0f241a 70%, #31513f);
  }

  &.is-custom {
    color: #f0e7ff;
    background: linear-gradient(140deg, #8a74d6, #6147b7 66%, #493195);
  }
}

.mine-member__identity-top,
.mine-member__progress-summary {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mine-member__level {
  min-width: 0;
  overflow: hidden;
  font-size: 30rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mine-member__code {
  flex: none;
  padding: 4rpx 14rpx;
  margin-left: $spacing-sm;
  font-size: $font-size-xs;
  border: 2rpx solid currentcolor;
  border-radius: 999rpx;
  opacity: 0.72;
}

.mine-member__brand {
  position: relative;
  z-index: 1;
  margin-top: 14rpx;
  font-size: 18rpx;
  letter-spacing: 4rpx;
  opacity: 0.58;
}

.mine-member__progress-summary {
  margin-top: auto;
  font-size: $font-size-xs;
  opacity: 0.68;
}

.mine-member__track {
  position: relative;
  z-index: 1;
  height: 8rpx;
  margin-top: 12rpx;
  overflow: hidden;
  background: rgba($color-bg, 0.34);
  border-radius: 8rpx;
}

.mine-member__fill {
  height: 100%;
  background: currentcolor;
  border-radius: inherit;
  opacity: 0.72;
}

.mine-member__stats {
  display: flex;
  padding: 28rpx 12rpx;
  margin: 16rpx 24rpx 0;
  background: rgba($color-bg, 0.96);
  border: 2rpx solid rgba($color-primary-dark, 0.05);
  border-radius: 24rpx;
  box-shadow: 0 14rpx 38rpx rgba($color-primary-dark, 0.07);
}

.mine-member__stat {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: $spacing-xs;
  align-items: center;

  & + &::before {
    position: absolute;
    top: 6rpx;
    bottom: 6rpx;
    left: 0;
    width: 2rpx;
    content: "";
    background: $color-line;
  }
}

.mine-member__stat-value {
  font-size: 40rpx;
  font-weight: 600;
  color: $color-text-title;
}

.mine-member__stat-label {
  font-size: $font-size-sm;
  color: $color-text-sub;
}
</style>
