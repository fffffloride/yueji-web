<template>
  <YjPage>
    <YjProductCard v-for="item in products" :key="item.id" :product="item" />
    <YjEmpty v-if="!loading && products.length === 0" text="暂无商品" />
    <view v-else-if="finished && products.length > 0" class="list-end">没有更多了</view>
  </YjPage>
</template>

<script setup lang="ts">
import ProductAPI, { type ProductItem } from "@/api/product";

const products = ref<ProductItem[]>([]);
const loading = ref(false);
const finished = ref(false);
const pageNum = ref(1);
const PAGE_SIZE = 10;
let requestSequence = 0;

/** 页面参数：categoryId 按分类过滤、tag 按标签过滤（如首页"热销"入口）、title 自定义标题 */
const query = reactive<{ categoryId?: string; tag?: string }>({});

async function fetchProducts(reset = false): Promise<void> {
  if (!reset && loading.value) return;
  const sequence = reset ? ++requestSequence : requestSequence;
  if (reset) {
    pageNum.value = 1;
    finished.value = false;
    products.value = [];
  }
  if (finished.value) return;

  loading.value = true;
  const requestedPage = pageNum.value;
  try {
    const result = await ProductAPI.getPage({
      pageNum: requestedPage,
      pageSize: PAGE_SIZE,
      categoryId: query.categoryId,
      ...(query.tag ? { tag: query.tag } : {}),
    } as Parameters<typeof ProductAPI.getPage>[0]);
    if (sequence !== requestSequence) return;
    products.value = [...products.value, ...result.list];
    finished.value = products.value.length >= result.total;
    pageNum.value = requestedPage + 1;
  } finally {
    if (sequence === requestSequence) loading.value = false;
  }
}

onLoad((options) => {
  query.categoryId = options?.categoryId;
  query.tag = options?.tag;
  if (options?.title) {
    uni.setNavigationBarTitle({ title: options.title });
  }
  fetchProducts(true);
});

onReachBottom(() => {
  fetchProducts();
});

onPullDownRefresh(async () => {
  await fetchProducts(true);
  uni.stopPullDownRefresh();
});
</script>

<style lang="scss" scoped>
.list-end {
  padding: 24rpx 0;
  font-size: 24rpx;
  color: #bbb;
  text-align: center;
}
</style>
