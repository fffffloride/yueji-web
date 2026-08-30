<template>
  <YjPage has-footer>
    <!-- 效果图展示区 -->
    <view class="detail-photos">
      <view v-for="index in 3" :key="index" class="detail-photos__item" />
    </view>
    <view class="detail-photo-caption">
      <view class="detail-photo-caption__store">{{ detailPhotoCaption.store }}</view>
      <view class="detail-photo-caption__meta">{{ detailPhotoCaption.meta }}</view>
    </view>

    <!-- 问答 -->
    <view class="detail-qa card">
      <view class="detail-qa__head">
        <wd-icon name="chat" size="32rpx" color="var(--yj-color-primary)" />
        <text class="detail-qa__title">问答</text>
        <text class="detail-qa__name">{{ productName }}</text>
        <view class="detail-qa__official">
          <wd-icon name="check-bold" size="18rpx" color="var(--yj-color-primary)" />
          <text>官方</text>
        </view>
      </view>

      <!-- 治疗数据四宫格 -->
      <view class="detail-qa__stats">
        <view v-for="(stat, index) in treatmentStats" :key="stat.label" class="detail-qa__stat">
          <text class="detail-qa__stat-label">{{ stat.label }}</text>
          <text class="detail-qa__stat-value">{{ stat.value }}</text>
          <view v-if="index > 0" class="detail-qa__stat-divider" />
        </view>
      </view>

      <!-- 品项介绍摘要 -->
      <view class="detail-qa__intro">
        <view class="detail-qa__intro-title">【{{ productName }}】品项介绍</view>
        <view class="detail-qa__intro-text">{{ introText(productName) }}</view>
      </view>
      <view class="detail-qa__more" @click="handleComingSoon">
        查看更多<wd-icon name="arrow-right" size="24rpx" />
      </view>
    </view>

    <!-- 详情胶囊 Tab -->
    <view class="detail-tabs card">
      <YjCapsuleTab v-model="activeDetailTab" :tabs="detailTabs" />
    </view>

    <!-- Tab 内容 -->
    <view class="detail-content card">
      <template v-if="activeDetailTab === 0">
        <view class="detail-content__section-title">· 品项介绍</view>
        <view class="detail-content__block">
          <view class="detail-content__block-title"><YjQTag />【{{ productName }}】品项介绍</view>
          <view class="detail-content__text">{{ introText(productName) }}</view>
        </view>
        <view class="detail-content__section-title">· 品项亮点</view>
        <view class="detail-content__block">
          <view class="detail-content__block-title"><YjQTag />【{{ productName }}】亮点优势</view>
          <view
            v-for="(line, index) in highlightText(productName)"
            :key="index"
            class="detail-content__text"
            :class="{ 'detail-content__text--bold': index === 0 }"
          >
            {{ line }}
          </view>
        </view>
      </template>

      <template v-else-if="activeDetailTab === 8">
        <view class="detail-content__block-title"><YjQTag />该项目做完需要注意哪些问题？</view>
        <view v-for="(tip, index) in postCareTips" :key="index" class="detail-content__text">
          {{ index + 1 }}、{{ tip }}
        </view>
        <view class="detail-content__end">没有更多了~</view>
      </template>

      <view v-else class="detail-content__loading">内容加载中...</view>
    </view>

    <!-- 项目详情 / 适用门店 -->
    <view class="detail-stores card">
      <view class="detail-stores__tabs">
        <view
          v-for="(tab, index) in storeTabs"
          :key="tab"
          class="detail-stores__tab"
          :class="{ 'detail-stores__tab--active': index === activeStoreTab }"
          @click="activeStoreTab = index"
        >
          {{ tab }}
        </view>
      </view>

      <template v-if="activeStoreTab === 1">
        <view
          v-for="store in detailStores"
          :key="store.address"
          class="detail-stores__item"
        >
          <view class="detail-stores__address">{{ store.address }}</view>
          <view class="detail-stores__distance">{{ store.distance }}</view>
        </view>
        <view class="detail-stores__all" @click="handleComingSoon">全部门店 ▾</view>

        <view class="detail-stores__notes">
          <view class="detail-stores__notes-title">购买须知</view>
          <template v-for="note in purchaseNotes" :key="note.title">
            <view class="detail-stores__notes-sub">{{ note.title }}</view>
            <view class="detail-stores__notes-text">{{ note.text }}</view>
          </template>
        </view>
      </template>

      <view v-else class="detail-stores__loading">项目详情内容</view>
    </view>

    <template #footer>
      <YjBuyBar label="立即购买" @buy="handleComingSoon" @consult="handleComingSoon" />
    </template>
  </YjPage>
</template>

<script setup lang="ts">
import {
  detailPhotoCaption,
  detailStores,
  detailTabs,
  highlightText,
  introText,
  postCareTips,
  purchaseNotes,
  treatmentStats,
} from "@/mocks/product-detail";

/** 门店区块的两个 Tab。 */
const storeTabs = ["项目详情", "适用门店"];

const productName = ref("钻石超塑");
const activeDetailTab = ref(0);
const activeStoreTab = ref(0);

onLoad((options) => {
  if (options?.name) {
    productName.value = decodeURIComponent(options.name);
    uni.setNavigationBarTitle({ title: productName.value });
  }
});

function handleComingSoon() {
  uni.showToast({ title: "敬请期待", icon: "none" });
}
</script>

<style lang="scss" scoped>
.detail-photos {
  display: flex;
  gap: $spacing-xs;
}

.detail-photos__item {
  flex: 1;
  height: 200rpx;
  background: linear-gradient(135deg, $color-primary-tint, $color-surface-rose);
  border-radius: 16rpx;
}

.detail-photo-caption {
  padding: $spacing-sm 0;
}

.detail-photo-caption__store {
  font-size: $font-size-xs;
  color: $color-text-sub;
}

.detail-photo-caption__meta {
  font-size: $font-size-xs;
  color: $color-text-placeholder;
}

.detail-qa {
  margin-bottom: $spacing-md;
}

.detail-qa__head {
  display: flex;
  gap: $spacing-xs;
  align-items: center;
  margin-bottom: $spacing-md;
}

.detail-qa__title,
.detail-qa__name {
  font-size: $font-size-lg;
  font-weight: bold;
  color: $color-text-title;
}

.detail-qa__official {
  display: flex;
  gap: 2rpx;
  align-items: center;
  padding: 2rpx 10rpx;
  font-size: 20rpx;
  color: $color-text-sub;
  border: 1rpx solid $color-primary-light;
  border-radius: 6rpx;
}

.detail-qa__stats {
  display: flex;
  margin-bottom: $spacing-md;
  overflow: hidden;
  background-color: $color-primary-tint;
  border-radius: 24rpx;
}

.detail-qa__stat {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: $spacing-xs;
  align-items: center;
  padding: $spacing-md 0;
}

.detail-qa__stat-divider {
  position: absolute;
  top: $spacing-sm;
  bottom: $spacing-sm;
  left: 0;
  width: 1rpx;
  background-color: $color-primary-lighter;
}

.detail-qa__stat-label {
  font-size: $font-size-xs;
  color: $color-text-sub;
}

.detail-qa__stat-value {
  font-size: $font-size-xs;
  font-weight: bold;
  line-height: 1.4;
  color: $color-text-title;
  text-align: center;
}

.detail-qa__intro {
  margin-bottom: $spacing-md;
}

.detail-qa__intro-title {
  margin-bottom: $spacing-sm;
  font-size: $font-size-md;
  font-weight: bold;
  color: $color-text-title;
}

.detail-qa__intro-text {
  font-size: $font-size-md;
  line-height: 1.7;
  color: $color-text-sub;
}

.detail-qa__more {
  display: flex;
  gap: $spacing-xs;
  align-items: center;
  font-size: $font-size-md;
  color: $color-text-sub;
}

.detail-tabs {
  padding-top: $spacing-md;
  padding-bottom: $spacing-md;
  margin-bottom: $spacing-md;
}

.detail-content {
  margin-bottom: $spacing-md;
}

.detail-content__section-title {
  margin-bottom: $spacing-md;
  font-size: $font-size-md;
  font-weight: bold;
  color: $color-text-content;
}

.detail-content__block {
  margin-bottom: $spacing-md;
}

.detail-content__block-title {
  display: flex;
  align-items: flex-start;
  margin-bottom: $spacing-sm;
  font-size: $font-size-md;
  font-weight: bold;
  color: $color-text-title;
}

.detail-content__text {
  font-size: $font-size-md;
  line-height: 1.7;
  color: $color-text-sub;

  + .detail-content__text {
    margin-top: $spacing-xs;
  }
}

.detail-content__text--bold {
  font-weight: bold;
  color: $color-text-title;
}

.detail-content__loading,
.detail-content__end {
  padding: $spacing-lg 0;
  font-size: $font-size-sm;
  color: $color-text-placeholder;
  text-align: center;
}

.detail-content__end {
  padding-top: $spacing-lg;
}

.detail-stores__tabs {
  display: flex;
  margin: (-$spacing-md) (-$spacing-md) 0;

  @include hairline(bottom);
}

.detail-stores__tab {
  flex: 1;
  padding: $spacing-md 0;
  font-size: $font-size-md;
  color: $color-text-placeholder;
  text-align: center;
  border-bottom: 4rpx solid transparent;
}

.detail-stores__tab--active {
  font-weight: 500;
  color: $color-text-title;
  border-bottom-color: $color-text-title;
}

.detail-stores__item {
  padding: $spacing-md 0;
  margin: $spacing-md 0;
  border: 1rpx solid $color-border;
  border-radius: 24rpx;

  & + .detail-stores__item {
    margin-top: -$spacing-xs;
  }
}

.detail-stores__address {
  padding: 0 $spacing-md;
  font-size: $font-size-xs;
  color: $color-text-title;
}

.detail-stores__distance {
  padding: $spacing-xs $spacing-md 0;
  font-size: $font-size-xs;
  color: $color-text-placeholder;
  text-align: right;
}

.detail-stores__all {
  padding: $spacing-sm 0;
  font-size: $font-size-md;
  color: $color-text-sub;
  text-align: center;
  border: 1rpx solid $color-border;
  border-radius: 24rpx;
}

.detail-stores__notes {
  margin-top: $spacing-lg;
}

.detail-stores__notes-title {
  margin-bottom: $spacing-sm;
  font-size: $font-size-md;
  font-weight: bold;
  color: $color-text-title;
}

.detail-stores__notes-sub {
  margin-top: $spacing-sm;
  font-size: $font-size-xs;
  font-weight: 500;
  color: $color-text-content;
}

.detail-stores__notes-text {
  margin-top: $spacing-xs;
  font-size: $font-size-xs;
  line-height: 1.7;
  color: $color-text-sub;
  white-space: pre-line;
}

.detail-stores__loading {
  padding: $spacing-lg 0;
  font-size: $font-size-sm;
  color: $color-text-placeholder;
  text-align: center;
}
</style>
