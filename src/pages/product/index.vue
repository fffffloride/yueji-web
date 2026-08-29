<template>
  <YjPage class="product-catalog-page" :tabbar="RoutePath.PRODUCT" :padded="false">
    <view class="product-nav" :style="{ paddingTop: `${statusBarHeight}px` }">
      <text>产品</text>
    </view>

    <view class="product-search-entry-wrap">
      <view class="product-search-entry" @click="openSearchDrawer">
        <wd-icon name="search" size="34rpx" color="#b7b7b7" />
        <text>搜项目</text>
      </view>
    </view>

    <view class="product-catalog">
      <scroll-view
        class="product-catalog__sidebar"
        scroll-y
        :scroll-into-view="leftScrollIntoView"
        :show-scrollbar="false"
      >
        <view
          v-for="group in catalog.groups"
          :id="leftDomId(group.id)"
          :key="group.id"
          class="product-catalog__category"
          :class="{ 'product-catalog__category--active': activeGroupId === group.id }"
          @click="selectGroup(group)"
        >
          {{ group.name }}
        </view>
      </scroll-view>

      <view class="product-catalog__main">
        <scroll-view
          class="product-catalog__list"
          scroll-y
          scroll-with-animation
          :scroll-into-view="rightScrollIntoView"
          :show-scrollbar="false"
          @scroll="handleScroll"
        >
          <view id="catalog-filter" class="product-catalog__filter">
            <text class="product-catalog__heart">♥</text>
            <text>仅查看疼痛友好项目</text>
            <view class="product-catalog__filter-switch">
              <wd-switch
                :model-value="painFriendly"
                :disabled="loading"
                size="40rpx"
                @change="handlePainFriendlyChange"
              />
            </view>
          </view>

          <view v-if="loading && !loaded" class="product-catalog__status">加载中…</view>
          <view v-else-if="loadError" class="product-catalog__status">
            <text>{{ loadError }}</text>
            <wd-button size="small" type="primary" @click="loadCatalog"> 重新加载 </wd-button>
          </view>
          <YjEmpty
            v-else-if="catalog.groups.length === 0"
            image="search"
            text="暂无符合条件的商品"
          />

          <view
            v-for="group in catalog.groups"
            v-else
            :id="groupDomId(group.id)"
            :key="group.id"
            class="catalog-group-anchor product-catalog__group"
          >
            <view class="product-catalog__group-title">{{ group.name }}</view>

            <scroll-view
              v-if="group.sections.length > 1"
              class="product-catalog__subnav"
              scroll-x
              :scroll-into-view="subScrollIntoView"
              :show-scrollbar="false"
            >
              <view
                v-for="section in group.sections"
                :id="tabDomId(group.id, section.id)"
                :key="section.id"
                class="product-catalog__subnav-item"
                :class="{
                  'product-catalog__subnav-item--active':
                    activeGroupId === group.id && activeSectionId === section.id,
                }"
                @click.stop="selectSection(group, section.id)"
              >
                {{ section.name }} ({{ section.total }})
              </view>
            </scroll-view>

            <view
              v-for="section in group.sections"
              :id="sectionDomId(section.id)"
              :key="section.id"
              class="catalog-section-anchor product-catalog__section"
            >
              <view v-if="group.sections.length > 1" class="product-catalog__section-title">
                {{ section.name }} ({{ section.total }})
              </view>
              <view v-if="section.products.length === 0" class="product-catalog__section-empty">
                暂无商品
              </view>
              <YjProductCard
                v-for="product in section.products"
                :key="product.id"
                :product="product"
              />
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <wd-popup
      v-model="searchDrawerVisible"
      position="right"
      root-portal
      :modal="false"
      :z-index="1000"
      :close-on-click-modal="false"
      custom-style="width: 100vw; height: 100vh; overflow: hidden; background: #fff;"
    >
      <view class="search-drawer" :style="{ paddingTop: `${statusBarHeight}px` }">
        <view class="search-drawer__nav">
          <view class="search-drawer__back" @click="closeSearchDrawer">
            <wd-icon name="arrow-left" size="44rpx" />
          </view>
          <text>搜索</text>
        </view>

        <wd-search
          v-model="searchKeyword"
          placeholder="搜项目"
          cancel-txt="搜索"
          placeholder-left
          :focus="searchDrawerVisible"
          @change="handleSearchChange"
          @search="handleSearch"
          @cancel="handleSearch"
          @clear="resetSearchResults"
        />

        <scroll-view
          class="search-drawer__content"
          scroll-y
          :show-scrollbar="false"
          :lower-threshold="80"
          @scrolltolower="loadMoreSearchResults"
        >
          <view v-if="!searchSearched && searchHistory.length" class="search-history">
            <view class="search-history__header">
              <text>历史记录</text>
              <wd-icon name="delete" size="32rpx" color="#999" @click="clearSearchHistory" />
            </view>
            <view class="search-history__tags">
              <view
                v-for="word in searchHistory"
                :key="word"
                class="search-history__tag"
                @click="searchHistoryWord(word)"
              >
                {{ word }}
              </view>
            </view>
          </view>

          <template v-if="searchSearched">
            <view v-if="searchLoading && searchProducts.length === 0" class="search-status">
              <wd-loading />
              <text>搜索中…</text>
            </view>
            <YjProductCard v-for="product in searchProducts" :key="product.id" :product="product" />
            <YjEmpty
              v-if="!searchLoading && searchProducts.length === 0"
              image="search"
              text="没有找到相关商品"
            />
            <view v-else-if="searchFinished && searchProducts.length > 0" class="search-end">
              没有更多了
            </view>
          </template>
        </scroll-view>
      </view>
    </wd-popup>
  </YjPage>
</template>

<script setup lang="ts">
import { onBackPress } from "@dcloudio/uni-app";
import ProductAPI, {
  type ProductCatalog,
  type ProductCatalogGroup,
  type ProductItem,
} from "@/api/product";
import { RoutePath } from "@/constants";
import {
  filterPainFriendlyCatalog,
  findActiveAnchor,
  type CatalogAnchor,
} from "@/utils/catalog-scroll";

interface ScrollEvent {
  detail: { scrollHeight: number; scrollTop: number };
}

interface ElementRect {
  height?: number;
  id?: string;
  top: number;
}

const SEARCH_HISTORY_KEY = "yj:product:search-history";
const SEARCH_HISTORY_LIMIT = 10;
const SEARCH_PAGE_SIZE = 10;

const catalog = ref<ProductCatalog>({ groups: [] });
const fullCatalog = ref<ProductCatalog>({ groups: [] });
const painFriendly = ref(false);
const loading = ref(false);
const loaded = ref(false);
const loadError = ref("");
const activeGroupId = ref("");
const activeSectionId = ref("");
const leftScrollIntoView = ref("");
const rightScrollIntoView = ref("");
const subScrollIntoView = ref("");
const groupAnchors = ref<CatalogAnchor[]>([]);
const sectionAnchors = ref<CatalogAnchor[]>([]);
const currentScrollTop = ref(0);
const currentScrollHeight = ref(0);
const listViewportHeight = ref(0);
const instance = getCurrentInstance();
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight ?? 0;
const searchDrawerVisible = ref(false);
const searchKeyword = ref("");
const submittedKeyword = ref("");
const searchSearched = ref(false);
const searchHistory = ref<string[]>(uni.getStorageSync(SEARCH_HISTORY_KEY) || []);
const searchProducts = ref<ProductItem[]>([]);
const searchLoading = ref(false);
const searchFinished = ref(false);
const searchPageNum = ref(1);

let jumping = false;
let jumpTimer: ReturnType<typeof setTimeout> | undefined;
let searchRequestSequence = 0;

const groupDomId = (id: string) => `catalog-group-${id}`;
const sectionDomId = (id: string) => `catalog-section-${id}`;
const leftDomId = (id: string) => `catalog-left-${id}`;
const tabDomId = (groupId: string, sectionId: string) => `catalog-tab-${groupId}-${sectionId}`;

function revealLeft(id: string): void {
  leftScrollIntoView.value = "";
  nextTick(() => {
    leftScrollIntoView.value = leftDomId(id);
  });
}

function revealSub(groupId: string, sectionId: string): void {
  subScrollIntoView.value = "";
  nextTick(() => {
    subScrollIntoView.value = tabDomId(groupId, sectionId);
  });
}

function setActive(groupId: string, sectionId: string): void {
  if (groupId && activeGroupId.value !== groupId) {
    activeGroupId.value = groupId;
    revealLeft(groupId);
  }
  if (sectionId && activeSectionId.value !== sectionId) {
    activeSectionId.value = sectionId;
    revealSub(groupId, sectionId);
  }
}

function firstActive(): void {
  const firstGroup = catalog.value.groups[0];
  activeGroupId.value = firstGroup?.id ?? "";
  activeSectionId.value = firstGroup?.sections[0]?.id ?? "";
  if (firstGroup) {
    revealLeft(firstGroup.id);
    if (activeSectionId.value) revealSub(firstGroup.id, activeSectionId.value);
  }
}

function scrollRightTo(domId: string): void {
  jumping = true;
  rightScrollIntoView.value = "";
  nextTick(() => {
    rightScrollIntoView.value = domId;
  });
  if (jumpTimer) clearTimeout(jumpTimer);
  jumpTimer = setTimeout(() => {
    jumping = false;
    syncActiveFromScroll(currentScrollTop.value);
  }, 600);
}

function selectGroup(group: ProductCatalogGroup): void {
  const firstSection = group.sections[0];
  setActive(group.id, firstSection?.id ?? "");
  scrollRightTo(groupDomId(group.id));
}

function selectSection(group: ProductCatalogGroup, sectionId: string): void {
  setActive(group.id, sectionId);
  scrollRightTo(sectionDomId(sectionId));
}

function syncActiveFromScroll(scrollTop: number): void {
  const position = scrollTop + uni.upx2px(24);
  const atEnd =
    currentScrollHeight.value > 0 &&
    scrollTop + listViewportHeight.value >= currentScrollHeight.value - 2;
  const groupId = findActiveAnchor(groupAnchors.value, position, atEnd);
  const group = catalog.value.groups.find((item) => item.id === groupId);
  if (!group) return;

  const sectionIds = new Set(group.sections.map((section) => section.id));
  const activeSection = findActiveAnchor(
    sectionAnchors.value.filter((anchor) => sectionIds.has(anchor.id)),
    position,
    atEnd
  );
  setActive(group.id, activeSection || group.sections[0]?.id || "");
}

function handleScroll(event: ScrollEvent): void {
  currentScrollTop.value = event.detail.scrollTop;
  currentScrollHeight.value = event.detail.scrollHeight;
  if (!jumping) syncActiveFromScroll(event.detail.scrollTop);
}

function measureAnchors(): void {
  const query = uni.createSelectorQuery();
  if (instance?.proxy) query.in(instance.proxy);
  query.select(".product-catalog__list").boundingClientRect();
  query.selectAll(".catalog-group-anchor").boundingClientRect();
  query.selectAll(".catalog-section-anchor").boundingClientRect();
  query.exec((results) => {
    const container = results[0] as ElementRect | undefined;
    const groups = (results[1] ?? []) as ElementRect[];
    const sections = (results[2] ?? []) as ElementRect[];
    if (!container) return;

    listViewportHeight.value = container.height ?? 0;
    groupAnchors.value = groups
      .filter((rect) => rect.id)
      .map((rect) => ({
        id: rect.id!.replace("catalog-group-", ""),
        top: rect.top - container.top + currentScrollTop.value,
      }));
    sectionAnchors.value = sections
      .filter((rect) => rect.id)
      .map((rect) => ({
        id: rect.id!.replace("catalog-section-", ""),
        top: rect.top - container.top + currentScrollTop.value,
      }));
    syncActiveFromScroll(currentScrollTop.value);
  });
}

function scheduleAnchorMeasure(): void {
  nextTick(() => {
    setTimeout(measureAnchors, 50);
  });
}

function applyPainFriendlyFilter(enabled: boolean): void {
  catalog.value = filterPainFriendlyCatalog(fullCatalog.value, enabled);
  painFriendly.value = enabled;
  currentScrollTop.value = 0;
  currentScrollHeight.value = 0;
  groupAnchors.value = [];
  sectionAnchors.value = [];
  firstActive();
  scrollRightTo("catalog-filter");
  scheduleAnchorMeasure();
}

async function loadCatalog(): Promise<void> {
  loading.value = true;
  loadError.value = "";
  try {
    const result = await ProductAPI.getCatalog();
    fullCatalog.value = result;
    loaded.value = true;
    applyPainFriendlyFilter(false);
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : "加载失败";
  } finally {
    loading.value = false;
  }
}

function handlePainFriendlyChange({ value }: { value: boolean }): void {
  applyPainFriendlyFilter(Boolean(value));
}

function resetSearchResults(): void {
  searchRequestSequence += 1;
  submittedKeyword.value = "";
  searchSearched.value = false;
  searchProducts.value = [];
  searchLoading.value = false;
  searchFinished.value = false;
  searchPageNum.value = 1;
}

function openSearchDrawer(): void {
  searchKeyword.value = "";
  resetSearchResults();
  searchDrawerVisible.value = true;
}

function closeSearchDrawer(): void {
  searchDrawerVisible.value = false;
  resetSearchResults();
}

function saveSearchHistory(word: string): void {
  searchHistory.value = [word, ...searchHistory.value.filter((item) => item !== word)].slice(
    0,
    SEARCH_HISTORY_LIMIT
  );
  uni.setStorageSync(SEARCH_HISTORY_KEY, searchHistory.value);
}

function clearSearchHistory(): void {
  searchHistory.value = [];
  uni.removeStorageSync(SEARCH_HISTORY_KEY);
}

async function fetchSearchProducts(reset = false): Promise<void> {
  if (!reset && (searchLoading.value || searchFinished.value)) return;
  const sequence = reset ? ++searchRequestSequence : searchRequestSequence;
  if (reset) {
    searchPageNum.value = 1;
    searchProducts.value = [];
    searchFinished.value = false;
  }

  searchLoading.value = true;
  const requestedPage = searchPageNum.value;
  try {
    const result = await ProductAPI.search({
      pageNum: requestedPage,
      pageSize: SEARCH_PAGE_SIZE,
      keyword: submittedKeyword.value,
    });
    if (sequence !== searchRequestSequence) return;
    searchProducts.value = [...searchProducts.value, ...result.list];
    searchFinished.value = searchProducts.value.length >= result.total;
    searchPageNum.value = requestedPage + 1;
  } finally {
    if (sequence === searchRequestSequence) searchLoading.value = false;
  }
}

function handleSearch(): void {
  const word = searchKeyword.value.trim();
  if (!word) {
    resetSearchResults();
    return;
  }
  searchKeyword.value = word;
  submittedKeyword.value = word;
  saveSearchHistory(word);
  searchSearched.value = true;
  void fetchSearchProducts(true);
}

function handleSearchChange({ value }: { value: string }): void {
  if (searchSearched.value && value.trim() !== submittedKeyword.value) resetSearchResults();
}

function searchHistoryWord(word: string): void {
  searchKeyword.value = word;
  handleSearch();
}

function loadMoreSearchResults(): void {
  if (searchSearched.value) void fetchSearchProducts();
}

onLoad(() => {
  loadCatalog();
});

onBackPress(() => {
  if (!searchDrawerVisible.value) return false;
  closeSearchDrawer();
  return true;
});

onBeforeUnmount(() => {
  if (jumpTimer) clearTimeout(jumpTimer);
});
</script>

<style lang="scss" scoped>
.product-catalog-page {
  height: calc(100vh - var(--window-top, 0px));
  min-height: 0;
  overflow: hidden;

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(.page__body) {
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding-top: 0;
    overflow: hidden;
    background: $color-bg;
  }
}

.product-nav,
.search-drawer__nav {
  position: relative;
  box-sizing: content-box;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: $color-text-title;
  background: $color-bg;
}

.product-search-entry-wrap {
  flex-shrink: 0;
  padding: 16rpx 24rpx;
  background: $color-bg;
}

.product-search-entry {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 64rpx;
  font-size: 28rpx;
  color: $color-text-placeholder;
  background: $color-bg-page;

  text {
    margin-left: 10rpx;
  }
}

.product-catalog {
  display: flex;
  flex: 1;
  min-height: 0;
  background: $color-bg;

  &__sidebar {
    flex-shrink: 0;
    width: 176rpx;
    height: 100%;
    background: $color-bg-page;
  }

  &__category {
    padding: 34rpx 20rpx 34rpx 28rpx;
    font-size: 27rpx;
    color: $color-text-content;

    &--active {
      padding-left: 22rpx;
      font-weight: 600;
      color: $color-text-title;
      background: $color-bg;
      border-left: 6rpx solid $color-primary-light;
    }
  }

  &__main {
    flex: 1;
    min-width: 0;
    height: 100%;
  }

  &__list {
    width: 100%;
    height: 100%;
  }

  &__filter {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 94rpx;
    padding: 0 20rpx;
    margin: 0 20rpx;
    font-size: 27rpx;
    color: $color-text-content;
    border-bottom: 2rpx solid $color-text-content;
  }

  &__filter-switch {
    margin-left: 14rpx;
  }

  &__heart {
    margin-right: 8rpx;
    color: $color-primary-light;
  }

  &__group {
    padding: 0 20rpx;
  }

  &__group-title,
  &__section-title {
    font-weight: 600;
    color: $color-text-title;
  }

  &__group-title {
    padding: 32rpx 0 18rpx;
    font-size: 34rpx;
  }

  &__subnav {
    position: sticky;
    top: 0;
    z-index: 2;
    padding: 10rpx 0 14rpx;
    white-space: nowrap;
    background: $color-bg;
  }

  &__subnav-item {
    display: inline-block;
    padding: 14rpx 22rpx;
    margin-right: 18rpx;
    font-size: 25rpx;
    color: $color-text-placeholder;
    background: $color-bg-page;

    &--active {
      color: $color-bg;
      background: $color-primary-dark;
    }
  }

  &__section-title {
    padding: 24rpx 0 8rpx;
    font-size: 30rpx;
  }

  &__section-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 180rpx;
    font-size: $font-size-sm;
    color: $color-text-placeholder;
  }

  &__status {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
    align-items: center;
    justify-content: center;
    min-height: 420rpx;
    font-size: $font-size-sm;
    color: $color-text-sub;
  }
}

.search-drawer {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: $color-bg;

  &__back {
    position: absolute;
    left: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64rpx;
    height: 64rpx;
  }

  &__content {
    box-sizing: border-box;
    flex: 1;
    width: 100%;
    min-height: 0;
    padding: 0 32rpx env(safe-area-inset-bottom);
  }
}

.search-history {
  padding-top: 32rpx;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 30rpx;
    font-weight: 600;
    color: $color-text-title;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    margin-top: 24rpx;
  }

  &__tag {
    padding: 12rpx 28rpx;
    margin: 0 16rpx 16rpx 0;
    font-size: 25rpx;
    color: $color-text-content;
    background: $color-bg-page;
    border-radius: 32rpx;
  }
}

.search-status {
  display: flex;
  gap: 12rpx;
  align-items: center;
  justify-content: center;
  min-height: 360rpx;
  color: $color-text-sub;
}

.search-end {
  padding: 24rpx 0;
  font-size: $font-size-sm;
  color: $color-text-placeholder;
  text-align: center;
}
</style>
