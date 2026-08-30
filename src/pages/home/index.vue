<template>
  <YjPage :tabbar="RoutePath.HOME" :padded="false">
    <!-- Hero 轮播 -->
    <view class="home-hero">
      <swiper
        class="home-hero__swiper"
        circular
        autoplay
        :interval="3500"
        :current="heroIndex"
        @change="handleHeroChange"
      >
        <swiper-item v-for="slide in heroSlides" :key="slide.title">
          <view class="home-hero__slide" :style="{ background: slide.bg }">
            <view class="home-hero__image" />
            <view class="home-hero__content">
              <view class="home-hero__brand">
                <YjLogo :size="28" />
                <text class="home-hero__brand-name">悦己DLumière</text>
              </view>
              <view class="home-hero__title">{{ slide.title }}</view>
              <view class="home-hero__subtitle">{{ slide.subtitle }}</view>
              <view class="home-hero__features">{{ slide.features }}</view>
              <view class="home-hero__foot">
                <text class="home-hero__tag">{{ slide.tag }}</text>
                <text class="home-hero__price">{{ formatPrice(slide.price, true) }}</text>
              </view>
            </view>
            <view class="home-hero__slogan">
              <text>悦己 · 由专业而美</text>
              <text>Beauty &amp; Healthy</text>
            </view>
          </view>
        </swiper-item>
      </swiper>

      <!-- Hero 悬浮操作 -->
      <view class="home-hero__nav">
        <view class="home-hero__consult">
          <wd-icon name="chat" size="24rpx" />
          <text>咨询/预约</text>
        </view>
        <view class="home-hero__actions">
          <view class="home-hero__action-btn" @click="handleComingSoon"><wd-icon name="ellipsis" size="32rpx" /></view>
          <view class="home-hero__action-btn" @click="handleComingSoon"><wd-icon name="scan" size="32rpx" /></view>
        </view>
      </view>

      <!-- 指示器 -->
      <view class="home-hero__dots">
        <view
          v-for="(slide, index) in heroSlides"
          :key="slide.title"
          class="home-hero__dot"
          :class="{ 'home-hero__dot--active': index === heroIndex }"
          @click="heroIndex = index"
        />
      </view>
    </view>

    <YjTrustBar :items="trustItems" />

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
      <view class="home-section home-consult card">
        <view class="home-consult__info">
          <view class="home-consult__title">
            <text class="home-consult__name">免费预约面诊</text>
            <text class="home-consult__badge">限时开启</text>
          </view>
          <view class="home-consult__desc">无需下单，即刻预约到店获取专属变美方案</view>
        </view>
        <view class="home-consult__button" @click="navigate(RoutePath.APPOINTMENT)">立即预约</view>
      </view>

      <!-- 近 30 天热榜 -->
      <view class="home-section home-hot card">
        <view class="home-hot__title">近30天热榜</view>
        <view class="home-hot__tabs">
          <YjCapsuleTab v-model="hotTab" :tabs="hotTabs" />
        </view>
        <YjRankItem
          v-for="product in hotProducts"
          :key="product.rank"
          :product="product"
          @click="goProductDetail(product.name)"
        />
      </view>

      <!-- 附近门店 -->
      <view class="home-section home-store card">
        <YjSectionTitle title="附近的悦己轻医美门店" show-more @more="handleComingSoon" />
        <view class="home-store__body">
          <YjStoreCard
            :name="nearbyStore.name"
            :address="nearbyStore.address"
            :meta="nearbyStore.cityTag"
            cover
            @click="handleComingSoon"
          />
        </view>
      </view>

      <!-- 品牌故事 -->
      <view class="home-section home-brand card">
        <view class="home-brand__head">
          <YjLogo :size="72" />
          <view class="home-brand__name">悦己DLumière</view>
          <view class="home-brand__slogan">悦 己 轻 医 美</view>
          <view class="home-brand__tagline">悦己DLumière 中国轻医美连锁品牌</view>
        </view>
        <view class="home-brand__body">
          <view class="home-brand__lead">{{ brandStory.slogan }}</view>
          <view
            v-for="(paragraph, index) in brandStory.paragraphs"
            :key="index"
            class="home-brand__paragraph"
            :class="{ 'home-brand__paragraph--emphasis': index === 1 }"
          >
            {{ paragraph }}
          </view>
        </view>
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
import { RoutePath } from "@/constants";
import {
  brandSections,
  brandStory,
  heroSlides,
  hotProducts,
  hotTabs,
  nearbyStore,
  newUserCoupon,
  promoCards,
  quickEntries,
  trustItems,
} from "@/mocks/home";
import { isLoggedIn as checkLoggedIn } from "@/utils/auth";
import { formatPrice } from "@/utils/format";
import { navigate } from "@/utils/navigate";

const heroIndex = ref(0);
const hotTab = ref(0);
const isLoggedIn = computed(() => checkLoggedIn());

function handleHeroChange(e: { detail: { current: number } }) {
  heroIndex.value = e.detail.current;
}

/** 快捷入口：前三项进我的预约（需登录），加入社群暂未开放。 */
function handleQuickEntry(index: number) {
  if (index === 3) {
    handleComingSoon();
    return;
  }
  navigate(RoutePath.MY_APPOINTMENT, { requireAuth: true });
}

/** 新人券：未登录去登录，已登录去券包。 */
function handleCouponClick() {
  if (!isLoggedIn.value) {
    navigate(RoutePath.LOGIN);
    return;
  }
  navigate(RoutePath.COUPON);
}

function goProductDetail(name: string) {
  navigate(RoutePath.PRODUCT_DETAIL, { params: { name } });
}

function handleComingSoon() {
  uni.showToast({ title: "敬请期待", icon: "none" });
}

onPullDownRefresh(() => {
  uni.stopPullDownRefresh();
});
</script>

<style lang="scss" scoped>
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
  transition: background 0.4s;
}

.home-hero__image {
  position: absolute;
  top: 0;
  right: 0;
  width: 56%;
  height: 100%;
  background: linear-gradient(135deg, $color-primary-tint, $color-surface-rose);
}

.home-hero__content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 40rpx;
}

.home-hero__brand {
  display: flex;
  gap: $spacing-xs;
  align-items: center;
  margin-bottom: $spacing-xs;
}

.home-hero__brand-name {
  font-size: $font-size-xs;
  font-weight: bold;
  color: $color-text-title;
  letter-spacing: 2rpx;
}

.home-hero__title {
  font-size: 64rpx;
  font-weight: 900;
  line-height: 1.2;
  color: $color-text-title;
}

.home-hero__subtitle {
  font-size: $font-size-md;
  color: $color-text-content;
}

.home-hero__features {
  margin-bottom: $spacing-sm;
  font-size: $font-size-sm;
  color: $color-text-sub;
}

.home-hero__foot {
  display: flex;
  gap: $spacing-sm;
  align-items: center;
}

.home-hero__tag {
  padding: 4rpx 16rpx;
  font-size: 20rpx;
  color: $color-bg;
  background-color: $color-primary;
  border-radius: 6rpx;
}

.home-hero__price {
  font-size: 40rpx;
  font-weight: bold;
  color: $color-text-title;
}

.home-hero__slogan {
  position: absolute;
  right: $spacing-md;
  bottom: $spacing-md;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 16rpx;
  color: $color-text-placeholder;
}

.home-hero__nav {
  position: absolute;
  top: 24rpx;
  right: $spacing-md;
  left: $spacing-md;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.home-hero__consult {
  display: flex;
  gap: $spacing-xs;
  align-items: center;
  padding: 12rpx $spacing-md;
  font-size: $font-size-sm;
  color: $color-text-content;
  background-color: rgb(255 255 255 / 90%);
  border: 1rpx solid $color-line;
  border-radius: 40rpx;
}

.home-hero__actions {
  display: flex;
  gap: $spacing-sm;
}

.home-hero__action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  background-color: rgb(255 255 255 / 90%);
  border: 1rpx solid $color-line;
  border-radius: 50%;
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
  background-color: rgb(0 0 0 / 20%);
  border-radius: 8rpx;
  transition: all 0.3s;
}

.home-hero__dot--active {
  width: 40rpx;
  background-color: $color-text-title;
}

.home-sections {
  padding: $spacing-md;
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
  background-color: $color-price;
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
  background-color: $color-text-title;
  border-radius: 24rpx;
}

.home-hot__title {
  padding-top: $spacing-sm;
  font-size: $font-size-lg;
  font-weight: bold;
  color: $color-text-title;
}

.home-hot__tabs {
  padding: $spacing-md 0 $spacing-sm;
}

.home-store__body {
  margin-top: $spacing-md;
}

.home-brand__head {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-lg $spacing-md;
  margin: (-$spacing-md) (-$spacing-md) $spacing-md;
  background-color: $color-surface-warm;
  border-radius: $radius-card $radius-card 0 0;
}

.home-brand__name {
  margin-top: $spacing-sm;
  font-size: $font-size-lg;
  font-weight: 900;
  color: $color-text-title;
  letter-spacing: 4rpx;
}

.home-brand__slogan {
  margin-top: $spacing-xs;
  font-size: $font-size-sm;
  color: $color-text-sub;
  letter-spacing: 8rpx;
}

.home-brand__tagline {
  margin-top: $spacing-xs;
  font-size: 20rpx;
  color: $color-text-placeholder;
}

.home-brand__lead {
  margin-bottom: $spacing-md;
  font-size: $font-size-md;
  font-weight: bold;
  color: $color-text-title;
}

.home-brand__paragraph {
  font-size: $font-size-md;
  line-height: 1.8;
  color: $color-text-sub;

  + .home-brand__paragraph {
    margin-top: $spacing-md;
  }
}

.home-brand__paragraph--emphasis {
  font-weight: 500;
  color: $color-text-content;
}

.home-brand-section {
  position: relative;
  height: 272rpx;
  padding: 40rpx;
  overflow: hidden;
  border-radius: 32rpx;
}

.home-brand-section__title {
  font-size: 48rpx;
  font-weight: bold;
  color: $color-text-title;
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
  color: $color-text-content;
  background-color: rgb(255 255 255 / 80%);
  border: 1rpx solid $color-border;
  border-radius: 6rpx;
}
</style>
