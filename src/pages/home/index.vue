<template>
  <YjPage :tabbar="RoutePath.HOME" :padded="false">
    <!-- #ifndef MP-WEIXIN -->
    <view class="home-platform-nav">悦己DLumière</view>
    <!-- #endif -->

    <view v-if="isDecorationLoading && !homeDecoration.banners.length" class="home-decoration-status">
      <wd-loading />
      <text>正在加载首页内容</text>
    </view>

    <!-- Hero 轮播 -->
    <view v-else-if="homeDecoration.banners.length" class="home-hero">
      <swiper
        class="home-hero__swiper"
        :circular="homeDecoration.banners.length > 1"
        :autoplay="homeDecoration.banners.length > 1"
        :interval="3500"
        :current="heroIndex"
        @change="handleHeroChange"
      >
        <swiper-item v-for="banner in homeDecoration.banners" :key="banner.id">
          <view class="home-hero__slide" @click="openBanner(banner)">
            <image
              v-if="!failedBannerIds.includes(banner.id)"
              class="home-hero__image"
              :src="banner.imageUrl"
              mode="aspectFill"
              @error="markBannerFailed(banner.id)"
            />
            <view v-else class="home-hero__placeholder">
              <YjLogo :size="64" />
              <text>悦己 · DLumière</text>
            </view>
          </view>
        </swiper-item>
      </swiper>

      <!-- Hero 悬浮操作 -->
      <view class="home-hero__nav" :style="heroNavStyle">
        <view class="home-hero__consult" @click="navigate(RoutePath.APPOINTMENT)">
          <wd-icon name="chat" size="24rpx" />
          <text>咨询/预约</text>
        </view>
      </view>

      <!-- 指示器 -->
      <view class="home-hero__dots">
        <view
          v-for="(banner, index) in homeDecoration.banners"
          :key="banner.id"
          class="home-hero__dot"
          :class="{ 'home-hero__dot--active': index === heroIndex }"
          @click="heroIndex = index"
        />
      </view>
    </view>

    <view v-if="decorationLoadError" class="home-decoration-error">
      <text>首页内容加载失败</text>
      <text class="home-decoration-error__retry" @click="loadDecoration">重新加载</text>
    </view>

    <YjTrustBar v-if="trustItems.length" :items="trustItems" />

    <view class="home-sections">
      <!-- 快捷入口 -->
      <view class="home-section card">
        <YjQuickEntry
          :title="isLoggedIn ? '你好，悦己用户' : 'HELLO，请登录'"
          :items="quickEntries"
          @click="handleQuickEntry"
        />
      </view>

      <!-- 新人券 -->
      <view class="home-section">
        <YjNewUserCoupon
          :amount="newUserCoupon.amount"
          title="新人350元券"
          :logged-in="isLoggedIn"
          :seconds="newUserCoupon.seconds"
          @click="handleCouponClick"
        />
      </view>

      <!-- 2×2 活动宫格 -->
      <view class="home-promo">
        <YjActivityCard
          v-for="card in promoCards"
          :key="card.title"
          :card="card"
          @click="handleComingSoon"
        />
      </view>

      <!-- 免费面诊 CTA -->
      <view class="home-section home-consult card" @click="navigate(RoutePath.APPOINTMENT)">
        <view class="home-consult__info">
          <view class="home-consult__title">
            <text class="home-consult__name">免费预约面诊</text>
            <text class="home-consult__badge">限时开启</text>
          </view>
          <view class="home-consult__desc">无需下单，即刻预约到店获取专属变美方案</view>
        </view>
        <view class="home-consult__button">立即预约</view>
      </view>

      <!-- 品牌故事 -->
      <view v-if="homeDecoration.brandContent" class="home-section home-brand card">
        <rich-text class="home-brand__body" :nodes="homeDecoration.brandContent" />
      </view>

      <!-- 品牌区块 -->
      <view
        v-for="section in brandSections"
        :key="section.title"
        class="home-section home-brand-section"
        :style="{ background: section.bg }"
        @click="handleComingSoon"
      >
        <view class="home-brand-section__title">{{ section.title }}</view>
        <view class="home-brand-section__sub">{{ section.sub }}</view>
        <view class="home-brand-section__line" />
        <view class="home-brand-section__button">了解详情</view>
      </view>
    </view>
  </YjPage>
</template>

<script setup lang="ts">
import DecorationAPI, { type HomeBanner, type HomeDecoration } from "@/api/decoration";
import { RoutePath } from "@/constants";
import {
  brandSections,
  newUserCoupon,
  promoCards,
  quickEntries,
} from "@/mocks/home";
import { isLoggedIn as checkLoggedIn } from "@/utils/auth";
import { navigate } from "@/utils/navigate";

const heroIndex = ref(0);
const homeDecoration = ref<HomeDecoration>({ banners: [], notices: [], brandContent: "" });
const failedBannerIds = ref<string[]>([]);
const isDecorationLoading = ref(false);
const decorationLoadError = ref("");
const heroNavStyle = getHeroNavStyle();
const isLoggedIn = computed(() => checkLoggedIn());
const trustItems = computed(() =>
  homeDecoration.value.notices.map((notice) => notice.title.trim()).filter(Boolean)
);

function getHeroNavStyle(): Record<string, string> {
  const style: Record<string, string> = {};
  // #ifdef MP-WEIXIN
  const systemInfo = uni.getSystemInfoSync();
  const menuButton = uni.getMenuButtonBoundingClientRect();
  const windowWidth = systemInfo.windowWidth || 375;
  const menuButtonTop = menuButton.top || (systemInfo.statusBarHeight || 20) + 6;
  const menuButtonLeft = menuButton.left || windowWidth - 95;
  style.top = `${menuButtonTop}px`;
  style.right = `${Math.max(12, windowWidth - menuButtonLeft + 8)}px`;
  style.height = `${menuButton.height || 32}px`;
  // #endif
  return style;
}

function handleHeroChange(e: { detail: { current: number } }) {
  heroIndex.value = e.detail.current;
}

function markBannerFailed(id: string) {
  if (!failedBannerIds.value.includes(id)) failedBannerIds.value.push(id);
}

function openBanner(banner: HomeBanner) {
  const linkUrl = banner.linkUrl?.trim();
  if (!linkUrl) return;
  if (linkUrl.startsWith("/")) {
    navigate(linkUrl);
    return;
  }
  navigate(RoutePath.WEBVIEW, { params: { url: linkUrl } });
}

async function loadDecoration() {
  if (isDecorationLoading.value) return;
  isDecorationLoading.value = true;
  decorationLoadError.value = "";
  try {
    homeDecoration.value = await DecorationAPI.getHome();
    failedBannerIds.value = [];
    heroIndex.value = 0;
  } catch (error) {
    decorationLoadError.value = error instanceof Error ? error.message : "首页内容加载失败";
  } finally {
    isDecorationLoading.value = false;
  }
}

/** 快捷入口：前三项进入现有预约页，加入社群暂未开放。 */
function handleQuickEntry(index: number) {
  if (index === 3) {
    handleComingSoon();
    return;
  }
  navigate(RoutePath.APPOINTMENT, { requireAuth: true });
}

/** 新人券：未登录去登录，已登录去券包。 */
function handleCouponClick() {
  if (!isLoggedIn.value) {
    navigate(RoutePath.LOGIN);
    return;
  }
  navigate(RoutePath.COUPON);
}

function handleComingSoon() {
  uni.showToast({ title: "敬请期待", icon: "none" });
}

onLoad(() => {
  void loadDecoration();
});

onPullDownRefresh(async () => {
  await loadDecoration();
  uni.stopPullDownRefresh();
});
</script>

<style lang="scss" scoped>
.home-platform-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  font-size: $font-size-md;
  font-weight: 600;
  color: $color-text-title;
  background-color: $color-bg;
}

.home-hero {
  position: relative;
}

.home-hero__swiper {
  height: 400rpx;
}

.home-hero__slide {
  position: relative;
  height: 100%;
  overflow: hidden;
  background-color: $color-primary-tint;
}

.home-hero__image {
  width: 100%;
  height: 100%;
}

.home-hero__placeholder {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: $font-size-lg;
  font-weight: 600;
  color: $color-primary;
  background: linear-gradient(135deg, $color-primary-tint, $color-bg 68%, $color-surface-warm);
}

.home-hero__nav {
  position: absolute;
  top: 24rpx;
  right: $spacing-md;
  left: $spacing-md;
  z-index: 2;
  display: flex;
  align-items: center;
  height: 64rpx;
}

.home-hero__consult {
  display: flex;
  gap: $spacing-xs;
  align-items: center;
  height: 100%;
  padding: 0 $spacing-md;
  font-size: $font-size-sm;
  font-weight: 600;
  color: $color-primary-dark;
  background-color: $color-primary-tint;
  border: 1rpx solid $color-primary-lighter;
  border-radius: 40rpx;
}

.home-hero__dots {
  position: absolute;
  bottom: 24rpx;
  left: 40rpx;
  display: flex;
  gap: 12rpx;
}

.home-hero__dot {
  width: 12rpx;
  height: 8rpx;
  background-color: rgb(255 255 255 / 72%);
  border-radius: 8rpx;
  transition: all 0.3s;
}

.home-hero__dot--active {
  width: 40rpx;
  background-color: $color-primary;
}

.home-decoration-status {
  display: flex;
  gap: $spacing-sm;
  align-items: center;
  justify-content: center;
  height: 400rpx;
  color: $color-text-sub;
  background-color: $color-primary-tint;
}

.home-decoration-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-sm $spacing-md;
  font-size: $font-size-sm;
  color: $color-text-sub;
  background-color: $color-bg;

  &__retry {
    color: $color-primary;
  }
}

.home-sections {
  padding: $spacing-md;
  background: linear-gradient(180deg, $color-primary-tint 0, $color-bg-page 132rpx);
}

.home-section {
  margin-bottom: $spacing-md;
}

.home-promo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.home-consult {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, $color-primary-tint, $color-bg 78%);
  border: 1rpx solid $color-line;
}

.home-consult__info {
  flex: 1;
  min-width: 0;
}

.home-consult__title {
  display: flex;
  gap: $spacing-sm;
  align-items: center;
  margin-bottom: $spacing-xs;
}

.home-consult__name {
  font-size: $font-size-lg;
  font-weight: bold;
  color: $color-text-title;
}

.home-consult__badge {
  padding: 2rpx 12rpx;
  font-size: 20rpx;
  color: $color-bg;
  background-color: $color-primary-lighter;
  border-radius: 6rpx;
}

.home-consult__desc {
  font-size: $font-size-xs;
  color: $color-text-sub;
}

.home-consult__button {
  flex-shrink: 0;
  padding: 16rpx $spacing-lg;
  margin-left: $spacing-md;
  font-size: $font-size-md;
  font-weight: bold;
  color: $color-bg;
  background: linear-gradient(135deg, $color-primary-light, $color-primary-dark);
  border-radius: 24rpx;
}

.home-brand__body {
  display: block;
  width: 100%;
  overflow: hidden;
  font-size: $font-size-md;
  line-height: 1.8;
  color: $color-text-sub;
  border-top: 4rpx solid $color-primary;

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(img) {
    max-width: 100% !important;
    height: auto !important;
  }
}

.home-brand-section {
  position: relative;
  height: 272rpx;
  padding: 40rpx;
  overflow: hidden;
  border: 1rpx solid $color-line;
  border-radius: 32rpx;
}

.home-brand-section__title {
  font-size: 48rpx;
  font-weight: bold;
  color: $color-primary-dark;
}

.home-brand-section__sub {
  margin-top: $spacing-xs;
  font-size: $font-size-md;
  line-height: 1.6;
  color: $color-text-sub;
  white-space: pre-line;
}

.home-brand-section__line {
  position: absolute;
  bottom: 24rpx;
  left: 40rpx;
  width: 160rpx;
  height: 4rpx;
  background: linear-gradient(to right, $color-primary, transparent);
}

.home-brand-section__button {
  position: absolute;
  right: 40rpx;
  bottom: $spacing-md;
  padding: 8rpx $spacing-md;
  font-size: $font-size-xs;
  color: $color-bg;
  background-color: $color-primary;
  border-radius: $radius-tag;
}
</style>
