<template>
  <YjPage class="product-catalog-page" :tabbar="RoutePath.PRODUCT" :padded="false">
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
            <wd-button size="small" type="primary" @click="loadCatalog(painFriendly)">
              重新加载
            </wd-button>
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
  </YjPage>
</template>

<script setup lang="ts">
import ProductAPI, {
  type ProductCatalog,
  type ProductCatalogGroup,
} from "@/api/product";
import { RoutePath } from "@/constants";
import { findActiveAnchor, type CatalogAnchor } from "@/utils/catalog-scroll";

interface ScrollEvent {
  detail: { scrollHeight: number; scrollTop: number };
}

interface ElementRect {
  height?: number;
  id?: string;
  top: number;
}

const catalog = ref<ProductCatalog>({ groups: [] });
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

let requestSequence = 0;
let jumping = false;
let jumpTimer: ReturnType<typeof setTimeout> | undefined;

const groupDomId = (id: string) => `catalog-group-${id}`;
const sectionDomId = (id: string) => `catalog-section-${id}`;
const leftDomId = (id: string) => `catalog-left-${id}`;
const tabDomId = (groupId: string, sectionId: string) =>
  `catalog-tab-${groupId}-${sectionId}`;

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

async function loadCatalog(nextPainFriendly = painFriendly.value): Promise<void> {
  const sequence = ++requestSequence;
  loading.value = true;
  if (!loaded.value) loadError.value = "";
  try {
    const result = await ProductAPI.getCatalog(nextPainFriendly);
    if (sequence !== requestSequence) return;
    catalog.value = result;
    painFriendly.value = nextPainFriendly;
    loaded.value = true;
    loadError.value = "";
    currentScrollTop.value = 0;
    firstActive();
    scrollRightTo("catalog-filter");
    scheduleAnchorMeasure();
  } catch (error) {
    if (sequence !== requestSequence) return;
    if (!loaded.value) loadError.value = error instanceof Error ? error.message : "加载失败";
  } finally {
    if (sequence === requestSequence) loading.value = false;
  }
}

function handlePainFriendlyChange({ value }: { value: boolean }): void {
  loadCatalog(Boolean(value));
}

onLoad(() => {
  loadCatalog();
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
    min-height: 0;
    padding-top: 0;
    overflow: hidden;
  }
}

.product-catalog {
  display: flex;
  height: 100%;
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
</style>
