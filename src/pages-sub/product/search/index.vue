<template>
  <YjPage>
    <wd-search
      v-model="keyword"
      placeholder="搜索项目 / 产品"
      cancel-txt="搜索"
      focus
      @search="handleSearch"
      @cancel="handleSearch"
    />

    <!-- 搜索历史 -->
    <view v-if="!searched && history.length" class="search-history">
      <view class="search-history__header">
        <text>搜索历史</text>
        <wd-icon name="delete" size="32rpx" color="#999" @click="clearHistory" />
      </view>
      <view class="search-history__tags">
        <view
          v-for="word in history"
          :key="word"
          class="search-history__tag"
          @click="searchWord(word)"
        >
          {{ word }}
        </view>
      </view>
    </view>

    <!-- 搜索结果 -->
    <template v-if="searched">
      <YjProductCard v-for="item in products" :key="item.id" :product="item" />
      <YjEmpty v-if="!loading && products.length === 0" image="search" text="没有找到相关商品" />
      <view v-else-if="finished && products.length > 0" class="search-end">没有更多了</view>
    </template>
  </YjPage>
</template>

<script setup lang="ts">
import ProductAPI, { type ProductItem } from "@/api/product";

const HISTORY_KEY = "yj:product:search-history";
const HISTORY_LIMIT = 10;

const keyword = ref("");
const searched = ref(false);
const history = ref<string[]>(uni.getStorageSync(HISTORY_KEY) || []);

const products = ref<ProductItem[]>([]);
const loading = ref(false);
const finished = ref(false);
const pageNum = ref(1);
const PAGE_SIZE = 10;

function saveHistory(word: string): void {
  const list = [word, ...history.value.filter((w) => w !== word)].slice(0, HISTORY_LIMIT);
  history.value = list;
  uni.setStorageSync(HISTORY_KEY, list);
}

function clearHistory(): void {
  history.value = [];
  uni.removeStorageSync(HISTORY_KEY);
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
    const result = await ProductAPI.search({
      pageNum: pageNum.value,
      pageSize: PAGE_SIZE,
      keyword: keyword.value,
    });
    products.value = [...products.value, ...result.list];
    finished.value = products.value.length >= result.total;
    pageNum.value += 1;
  } finally {
    loading.value = false;
  }
}

function handleSearch(): void {
  const word = keyword.value.trim();
  if (!word) return;
  saveHistory(word);
  searched.value = true;
  fetchProducts(true);
}

function searchWord(word: string): void {
  keyword.value = word;
  handleSearch();
}

onReachBottom(() => {
  if (searched.value) fetchProducts();
});
</script>

<style lang="scss" scoped>
.search-history {
  padding: 24rpx 8rpx;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 28rpx;
    color: #333;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    margin-top: 16rpx;
  }

  &__tag {
    padding: 8rpx 28rpx;
    margin: 0 16rpx 16rpx 0;
    font-size: 24rpx;
    color: #666;
    background: #f5f5f5;
    border-radius: 28rpx;
  }
}

.search-end {
  padding: 24rpx 0;
  font-size: 24rpx;
  color: #bbb;
  text-align: center;
}
</style>
