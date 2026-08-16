<template>
  <YjPage :tabbar="RoutePath.PRODUCT" :padded="false">
    <view class="product-center">
      <!-- 顶部搜索 -->
      <view class="product-center__search" @click="navigate(RoutePath.PRODUCT_SEARCH)">
        <wd-icon name="search" size="32rpx" color="#999" />
        <text class="product-center__search-placeholder">搜索项目 / 产品</text>
      </view>

      <view class="product-center__main">
        <!-- 左侧一级分类 -->
        <scroll-view class="product-center__sidebar" scroll-y>
          <view
            class="product-center__cat"
            :class="{ 'product-center__cat--active': activeCategoryId === '' }"
            @click="selectCategory('')"
          >
            全部
          </view>
          <view
            v-for="cat in categories"
            :key="cat.id"
            class="product-center__cat"
            :class="{ 'product-center__cat--active': activeCategoryId === cat.id }"
            @click="selectCategory(cat.id)"
          >
            {{ cat.name }}
          </view>
        </scroll-view>

        <!-- 右侧商品区 -->
        <view class="product-center__content">
          <!-- 二级分类 -->
          <scroll-view v-if="subCategories.length" class="product-center__subcats" scroll-x>
            <view
              class="product-center__subcat"
              :class="{ 'product-center__subcat--active': activeSubCategoryId === '' }"
              @click="selectSubCategory('')"
            >
              全部
            </view>
            <view
              v-for="sub in subCategories"
              :key="sub.id"
              class="product-center__subcat"
              :class="{ 'product-center__subcat--active': activeSubCategoryId === sub.id }"
              @click="selectSubCategory(sub.id)"
            >
              {{ sub.name }}
            </view>
          </scroll-view>

          <!-- 排序栏 -->
          <view class="product-center__sort">
            <view
              v-for="opt in sortOptions"
              :key="opt.value"
              class="product-center__sort-item"
              :class="{ 'product-center__sort-item--active': sortValue === opt.value }"
              @click="changeSort(opt.value)"
            >
              {{ opt.label }}
              <template v-if="opt.value === 'price'">
                <text v-if="sortValue === 'price'">{{ priceOrder === "asc" ? "↑" : "↓" }}</text>
              </template>
            </view>
          </view>

          <!-- 商品列表 -->
          <scroll-view class="product-center__list" scroll-y @scrolltolower="loadMore">
            <YjProductCard v-for="item in products" :key="item.id" :product="item" />
            <YjEmpty v-if="!loading && products.length === 0" text="暂无商品" />
            <view v-else-if="finished && products.length > 0" class="product-center__end">
              没有更多了
            </view>
          </scroll-view>
        </view>
      </view>
    </view>
  </YjPage>
</template>

<script setup lang="ts">
import ProductAPI, { type CategoryItem, type ProductItem } from "@/api/product";
import { RoutePath } from "@/constants";
import { navigate } from "@/utils/navigate";

type SortValue = "default" | "sales" | "price" | "new";

const sortOptions: { label: string; value: SortValue }[] = [
  { label: "综合", value: "default" },
  { label: "销量", value: "sales" },
  { label: "价格", value: "price" },
  { label: "新品", value: "new" },
];

const categories = ref<CategoryItem[]>([]);
const activeCategoryId = ref("");
const activeSubCategoryId = ref("");
const sortValue = ref<SortValue>("default");
const priceOrder = ref<"asc" | "desc">("asc");

const products = ref<ProductItem[]>([]);
const loading = ref(false);
const finished = ref(false);
const pageNum = ref(1);
const PAGE_SIZE = 10;

const subCategories = computed(() => {
  const current = categories.value.find((c) => c.id === activeCategoryId.value);
  return current?.children ?? [];
});

async function loadCategories(): Promise<void> {
  try {
    categories.value = await ProductAPI.getCategories();
  } catch {
    // 请求层已 toast
  }
}

async function fetchProducts(reset = false): Promise<void> {
  if (loading.value) return;
  if (reset) {
    pageNum.value = 1;
    finished.value = false;
    products.value = [];
  }
  if (finished.value) return;

  loading.value = true;
  try {
    const result = await ProductAPI.getPage({
      pageNum: pageNum.value,
      pageSize: PAGE_SIZE,
      categoryId: activeSubCategoryId.value || activeCategoryId.value || undefined,
      sortBy: sortValue.value === "default" ? undefined : sortValue.value,
      order: sortValue.value === "price" ? priceOrder.value : undefined,
    });
    products.value = [...products.value, ...result.list];
    finished.value = products.value.length >= result.total;
    pageNum.value += 1;
  } catch {
    // 请求层已 toast
  } finally {
    loading.value = false;
  }
}

function selectCategory(id: string): void {
  activeCategoryId.value = id;
  activeSubCategoryId.value = "";
  fetchProducts(true);
}

function selectSubCategory(id: string): void {
  activeSubCategoryId.value = id;
  fetchProducts(true);
}

function changeSort(value: SortValue): void {
  if (value === "price" && sortValue.value === "price") {
    priceOrder.value = priceOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortValue.value = value;
    if (value === "price") priceOrder.value = "asc";
  }
  fetchProducts(true);
}

function loadMore(): void {
  fetchProducts();
}

onShow(() => {
  if (categories.value.length === 0) {
    loadCategories();
    fetchProducts(true);
  }
});
</script>

<style lang="scss" scoped>
.product-center {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__search {
    display: flex;
    align-items: center;
    padding: 16rpx 24rpx;
    margin: 20rpx 24rpx;
    background: #f5f5f5;
    border-radius: 32rpx;
  }

  &__search-placeholder {
    margin-left: 12rpx;
    font-size: 26rpx;
    color: #999;
  }

  &__main {
    display: flex;
    flex: 1;
    min-height: 0;
  }

  &__sidebar {
    flex-shrink: 0;
    width: 176rpx;
    height: 100%;
    background: #f7f8fa;
  }

  &__cat {
    padding: 28rpx 16rpx;
    font-size: 26rpx;
    color: #666;
    text-align: center;

    &--active {
      font-weight: 600;
      color: #2d5a3d;
      background: #fff;
      border-left: 6rpx solid #2d5a3d;
    }
  }

  &__content {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    padding: 0 20rpx;
  }

  &__subcats {
    flex-shrink: 0;
    white-space: nowrap;
  }

  &__subcat {
    display: inline-block;
    padding: 8rpx 24rpx;
    margin: 16rpx 12rpx 8rpx 0;
    font-size: 24rpx;
    color: #666;
    background: #f5f5f5;
    border-radius: 24rpx;

    &--active {
      color: #fff;
      background: #2d5a3d;
    }
  }

  &__sort {
    display: flex;
    flex-shrink: 0;
    padding: 16rpx 0;
  }

  &__sort-item {
    margin-right: 40rpx;
    font-size: 26rpx;
    color: #666;

    &--active {
      font-weight: 600;
      color: #2d5a3d;
    }
  }

  &__list {
    flex: 1;
    min-height: 0;
  }

  &__end {
    padding: 24rpx 0;
    font-size: 24rpx;
    color: #bbb;
    text-align: center;
  }
}
</style>
