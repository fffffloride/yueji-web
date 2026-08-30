<template>
  <YjPage :tabbar="RoutePath.PRODUCT" :padded="false">
    <view class="proj">
      <!-- 门店选择器 -->
      <view class="proj__store">
        <view class="proj__store-name" @click="handleComingSoon">
          <text class="proj__store-text">{{ projectStore.name }}</text>
          <wd-icon name="arrow-right" size="20rpx" />
        </view>
        <view class="proj__search" @click="navigate(RoutePath.PRODUCT_SEARCH)">
          <wd-icon name="search" size="24rpx" />
          <text>搜项目</text>
        </view>
      </view>

      <!-- 距离 -->
      <view class="proj__distance">
        <wd-icon name="pin" size="24rpx" color="var(--yj-color-primary)" />
        <text>{{ projectStore.distance }}</text>
      </view>

      <!-- 横幅轮播 -->
      <scroll-view class="proj__banners" scroll-x :show-scrollbar="false">
        <view
          v-for="banner in projectBanners"
          :key="banner.title"
          class="proj__banner"
          :style="{ background: banner.bg }"
          @click="handleComingSoon"
        >
          <view class="proj__banner-brand">
            <YjLogo :size="24" />
            <text>悦己DLumière</text>
          </view>
          <view class="proj__banner-title">{{ banner.title }}</view>
          <view class="proj__banner-sub">{{ banner.sub }}</view>
        </view>
      </scroll-view>

      <!-- 左分类 + 右列表 -->
      <view class="proj__main">
        <scroll-view class="proj__sidebar" scroll-y :show-scrollbar="false">
          <view
            v-for="category in projectCategories"
            :key="category.label"
            class="proj__cat"
            :class="{ 'proj__cat--active': category.label === activeCategory }"
            @click="handleCategoryChange(category)"
          >
            <text v-if="category.badge" class="proj__cat-badge">{{ category.badge }}</text>
            <text class="proj__cat-label">{{ category.label }}</text>
          </view>
        </scroll-view>

        <scroll-view class="proj__list" scroll-y :show-scrollbar="false">
          <!-- 疼痛友好开关 -->
          <view class="proj__filter">
            <wd-icon name="heart" size="24rpx" color="var(--yj-color-primary)" />
            <text class="proj__filter-text">仅查看疼痛友好项目</text>
            <view
              class="proj__switch"
              :class="{ 'proj__switch--on': friendlyOnly }"
              @click="friendlyOnly = !friendlyOnly"
            >
              <view class="proj__switch-knob" />
            </view>
          </view>

          <!-- 免下单预约通道 -->
          <view class="proj__free" @click="handleComingSoon">免下单预约通道｜到店咨询变美方案</view>

          <!-- 商品分组 -->
          <view v-for="section in sections" :key="section.title" class="proj__section">
            <view class="proj__section-title">{{ section.title }}</view>
            <view v-for="item in section.items" :key="item.name" class="proj__section-item">
              <YjProductCard :product="item" @click="goProductDetail(item.name)" />
            </view>
          </view>

          <YjEmpty v-if="!sections.length" text="该分类暂无项目" />
          <view class="proj__list-footer" />
        </scroll-view>
      </view>
    </view>
  </YjPage>
</template>

<script setup lang="ts">
import { RoutePath } from "@/constants";
import {
  projectBanners,
  projectCategories,
  projectData,
  projectStore,
  type ProjectCategory,
  type ProjectSection,
} from "@/mocks/project";
import { navigate } from "@/utils/navigate";

const activeCategory = ref(projectCategories[0]!.label);
const friendlyOnly = ref(false);

/** 当前分类的商品分组，未配置数据的类目展示空态。 */
const sections = computed<ProjectSection[]>(() => {
  const all = projectData[activeCategory.value] ?? [];
  if (!friendlyOnly.value) return all;
  return all
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.isFriendly),
    }))
    .filter((section) => section.items.length > 0);
});

function handleCategoryChange(category: ProjectCategory) {
  if (category.label === activeCategory.value) return;
  activeCategory.value = category.label;
}

function goProductDetail(name: string) {
  navigate(RoutePath.PRODUCT_DETAIL, { params: { name } });
}

function handleComingSoon() {
  uni.showToast({ title: "敬请期待", icon: "none" });
}
</script>

<style lang="scss" scoped>
.proj {
  display: flex;
  flex-direction: column;

  // 100vh - 原生导航栏 - 自定义 TabBar 占位（含安全区）
  height: calc(100vh - 88rpx - #{$height-tabbar} - #{$spacing-lg});
}

.proj__store {
  display: flex;
  gap: $spacing-md;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-sm $spacing-md;

  @include hairline(bottom);
}

.proj__store-name {
  display: flex;
  flex: 1;
  gap: $spacing-xs;
  align-items: center;
  min-width: 0;
}

.proj__store-text {
  font-size: $font-size-sm;
  font-weight: 500;
  color: $color-text-title;

  @include ellipsis;
}

.proj__search {
  display: flex;
  flex-shrink: 0;
  gap: $spacing-xs;
  align-items: center;
  padding: 8rpx $spacing-sm;
  font-size: $font-size-xs;
  color: $color-text-placeholder;
  border: 1rpx solid $color-border;
  border-radius: 16rpx;
}

.proj__distance {
  display: flex;
  gap: $spacing-xs;
  align-items: center;
  padding: 12rpx $spacing-md;
  font-size: $font-size-xs;
  color: $color-text-sub;

  @include hairline(bottom);
}

.proj__banners {
  padding: $spacing-sm $spacing-md;
  white-space: nowrap;
}

.proj__banner {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  flex-direction: column;
  width: 320rpx;
  height: 180rpx;
  padding: 20rpx;
  margin-right: $spacing-sm;
  overflow: hidden;
  background: linear-gradient(135deg, $color-primary-tint, $color-surface-rose);
  border-radius: 24rpx;

  &:last-child {
    margin-right: 0;
  }
}

.proj__banner-brand {
  display: flex;
  gap: $spacing-xs;
  align-items: center;
  margin-bottom: $spacing-xs;
  font-size: 18rpx;
  font-weight: bold;
  color: $color-text-title;
}

.proj__banner-title {
  font-size: $font-size-sm;
  font-weight: bold;
  color: $color-text-title;
}

.proj__banner-sub {
  font-size: 18rpx;
  line-height: 1.5;
  color: $color-text-sub;
  white-space: pre-line;
}

.proj__main {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.proj__sidebar {
  flex-shrink: 0;
  width: 144rpx;
  height: 100%;
  background-color: $color-bg;
  border-right: 1rpx solid $color-line;
}

.proj__cat {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-lg 0;
  border-left: 6rpx solid transparent;
}

.proj__cat--active {
  font-weight: 600;
  background-color: $color-primary-tint;
  border-left-color: $color-primary;
}

.proj__cat-badge {
  position: absolute;
  top: $spacing-xs;
  right: $spacing-xs;
  padding: 2rpx 8rpx;
  font-size: 16rpx;
  font-weight: bold;
  color: $color-bg;
  background-color: $color-price;
  border-radius: 6rpx;
}

.proj__cat-label {
  font-size: $font-size-sm;
  line-height: 1.3;
  color: $color-text-sub;
  text-align: center;
}

.proj__cat--active .proj__cat-label {
  color: $color-primary;
}

.proj__list {
  flex: 1;
  min-width: 0;
  height: 100%;
  background-color: $color-bg;
}

.proj__filter {
  display: flex;
  gap: $spacing-xs;
  align-items: center;
  justify-content: flex-end;
  padding: $spacing-sm $spacing-md;

  @include hairline(bottom);
}

.proj__filter-text {
  font-size: $font-size-xs;
  color: $color-text-sub;
}

.proj__switch {
  position: relative;
  flex-shrink: 0;
  width: 72rpx;
  height: 40rpx;
  background-color: $color-text-disabled;
  border-radius: 20rpx;
  transition: background-color 0.3s;
}

.proj__switch--on {
  background-color: $color-primary;
}

.proj__switch-knob {
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  width: 32rpx;
  height: 32rpx;
  background-color: $color-bg;
  border-radius: 50%;
  transition: left 0.3s;
}

.proj__switch--on .proj__switch-knob {
  left: 36rpx;
}

.proj__free {
  display: flex;
  align-items: center;
  height: 96rpx;
  padding: 0 $spacing-md;
  margin: $spacing-sm $spacing-md;
  font-size: $font-size-sm;
  font-weight: bold;
  color: $color-bg;
  background-color: $color-text-title;
  border-radius: 16rpx;
}

.proj__section {
  padding: 0 $spacing-md;
}

.proj__section-title {
  padding-top: $spacing-md;
  font-size: $font-size-md;
  font-weight: bold;
  color: $color-text-title;
}

.proj__section-item {
  padding: 0 $spacing-md;
  margin: 0 (-$spacing-md);
}

.proj__list-footer {
  height: $spacing-lg;
}
</style>
