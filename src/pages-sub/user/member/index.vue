<template>
  <YjPage :padded="false">
    <view class="member-page">
      <view v-if="loading" class="member-state"><wd-loading size="48rpx" /></view>

      <YjEmpty v-else-if="loadError" image="network" :text="loadError">
        <view class="member-retry" @click="loadAccount">重新加载</view>
      </YjEmpty>

      <template v-else-if="account">
        <view class="member-hero">
          <view class="member-hero__code">{{ account.level?.code || "--" }}</view>
          <view class="member-hero__eyebrow">当前等级</view>
          <view class="member-hero__name">{{ account.level?.name || "暂无可用等级" }}</view>
          <view class="member-hero__discount">
            {{ account.level ? discountLabel(account.level.discountRate) : "暂无等级权益" }}
          </view>
          <view class="member-hero__spent">
            <text>累计完成订单实付</text>
            <text>{{ formatPrice(account.totalSpent, true) }}</text>
          </view>
        </view>

        <view class="member-progress card">
          <view class="member-section__title">升级进度</view>
          <view class="member-progress__summary">
            <text>{{ progressTitle }}</text>
            <text>{{ progressPercent }}%</text>
          </view>
          <view class="member-progress__track">
            <view class="member-progress__fill" :style="{ width: `${progressPercent}%` }" />
          </view>
          <view class="member-progress__hint">{{ progressHint }}</view>
        </view>

        <view class="member-levels card">
          <view class="member-section__title">会员等级</view>
          <view v-if="account.levels.length" class="member-levels__list">
            <view
              v-for="level in account.levels"
              :key="level.id"
              class="member-level"
              :class="{ 'is-current': level.id === account.level?.id }"
            >
              <view class="member-level__code">{{ level.code }}</view>
              <view class="member-level__content">
                <view class="member-level__name">
                  <text>{{ level.name }}</text>
                  <text v-if="level.id === account.level?.id" class="member-level__current">
                    当前
                  </text>
                </view>
                <view class="member-level__threshold">{{ thresholdLabel(level.thresholdAmount) }}</view>
              </view>
              <view class="member-level__discount">{{ discountLabel(level.discountRate) }}</view>
            </view>
          </view>
          <YjEmpty v-else text="暂无可用等级" />
        </view>
      </template>
    </view>
  </YjPage>
</template>

<script setup lang="ts">
import MarketingAPI, { type PointsAccount } from "@/api/marketing";
import { formatPrice } from "@/utils/format";
import { memberLevelProgress } from "@/utils/member-level";

const account = ref<PointsAccount | null>(null);
const loading = ref(true);
const loadError = ref("");

const progressPercent = computed(() => Math.round(memberLevelProgress(account.value)));
const progressTitle = computed(() =>
  account.value?.nextLevel ? `距离 ${account.value.nextLevel.name}` : "已达最高等级"
);
const progressHint = computed(() => {
  if (!account.value) return "";
  if (!account.value.nextLevel) return "当前已是最高等级，累计消费不设上限";
  const remaining = Math.max(0, account.value.nextLevel.thresholdAmount - account.value.totalSpent);
  return `再消费 ${formatPrice(remaining, true)} 即可升级至 ${account.value.nextLevel.name}`;
});

function discountLabel(rate: number): string {
  if (rate === 10_000) return "不打折";
  return `${Number((rate / 1000).toFixed(1))} 折`;
}

function thresholdLabel(amount: number): string {
  return `${formatPrice(amount).replace(/\.00$/, "")} 元起`;
}

async function loadAccount() {
  if (loading.value && account.value) return;
  loading.value = true;
  loadError.value = "";
  try {
    account.value = await MarketingAPI.getPointsAccount();
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : "会员信息加载失败";
  } finally {
    loading.value = false;
  }
}

onLoad(() => {
  void loadAccount();
});
</script>

<style lang="scss" scoped>
.member-page {
  min-height: 100vh;
  padding: $spacing-md $page-padding $spacing-lg;
}

.member-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 480rpx;
}

.member-retry {
  padding: $spacing-sm $spacing-lg;
  margin-top: $spacing-md;
  font-size: $font-size-sm;
  color: $color-primary;
  border: 2rpx solid $color-primary;
  border-radius: $radius-button;
}

.member-hero {
  position: relative;
  padding: 48rpx $spacing-lg $spacing-lg;
  overflow: hidden;
  color: $color-bg;
  background: linear-gradient(138deg, $color-primary-dark 0%, $color-primary 58%, #49775a 100%);
  border-radius: 28rpx;

  &::after {
    position: absolute;
    top: -110rpx;
    right: -60rpx;
    width: 320rpx;
    height: 320rpx;
    content: "";
    border: 2rpx solid rgba($color-bg, 0.1);
    border-radius: 50%;
  }
}

.member-hero__code {
  position: absolute;
  top: $spacing-lg;
  right: $spacing-lg;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88rpx;
  height: 88rpx;
  font-size: $font-size-lg;
  font-weight: 700;
  background: rgba($color-bg, 0.14);
  border: 2rpx solid rgba($color-bg, 0.24);
  border-radius: 50%;
}

.member-hero__eyebrow {
  font-size: $font-size-sm;
  color: rgba($color-bg, 0.7);
}

.member-hero__name {
  max-width: 480rpx;
  margin-top: $spacing-xs;
  overflow: hidden;
  font-size: 52rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-hero__discount {
  margin-top: $spacing-xs;
  font-size: $font-size-sm;
  color: rgba($color-bg, 0.76);
}

.member-hero__spent {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: $spacing-md;
  margin-top: $spacing-lg;
  font-size: $font-size-sm;
  border-top: 2rpx solid rgba($color-bg, 0.14);
}

.member-progress,
.member-levels {
  margin-top: $spacing-md;
}

.member-section__title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: $color-text-title;
}

.member-progress__summary {
  display: flex;
  justify-content: space-between;
  margin-top: $spacing-md;
  font-size: $font-size-sm;
  color: $color-text-sub;
}

.member-progress__track {
  height: 20rpx;
  margin-top: $spacing-sm;
  overflow: hidden;
  background: $color-primary-tint;
  border-radius: $radius-tag;
}

.member-progress__fill {
  height: 100%;
  background: linear-gradient(to right, $color-primary-lighter, $color-primary);
  border-radius: $radius-tag;
}

.member-progress__hint {
  margin-top: $spacing-sm;
  font-size: $font-size-xs;
  color: $color-text-placeholder;
}

.member-levels {
  padding-bottom: 0;
}

.member-levels__list {
  margin-top: $spacing-sm;
}

.member-level {
  display: flex;
  gap: $spacing-sm;
  align-items: center;
  min-height: 116rpx;
  border-top: 2rpx solid $color-line;

  &.is-current {
    padding-right: $spacing-md;
    padding-left: $spacing-md;
    margin-right: -$spacing-md;
    margin-left: -$spacing-md;
    background: $color-primary-tint;
  }
}

.member-level__code {
  display: flex;
  flex: 0 0 64rpx;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  font-size: $font-size-sm;
  font-weight: 700;
  color: $color-primary;
  border: 2rpx solid $color-primary-lighter;
  border-radius: 50%;
}

.member-level__content {
  flex: 1;
  min-width: 0;
}

.member-level__name {
  display: flex;
  gap: $spacing-xs;
  align-items: center;
  font-size: $font-size-md;
  font-weight: 600;
  color: $color-text-title;
}

.member-level__current {
  padding: 2rpx 10rpx;
  font-size: 18rpx;
  font-weight: 400;
  color: $color-primary;
  background: $color-bg;
  border-radius: $radius-tag;
}

.member-level__threshold {
  margin-top: 4rpx;
  font-size: $font-size-xs;
  color: $color-text-placeholder;
}

.member-level__discount {
  font-size: $font-size-sm;
  font-weight: 600;
  color: $color-primary;
}
</style>
