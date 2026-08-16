<template>
  <YjPage v-if="product" :padded="false" has-footer>
    <!-- 轮播 -->
    <swiper class="detail__swiper" indicator-dots circular>
      <swiper-item v-if="product.video">
        <video class="detail__media" :src="product.video" object-fit="cover" />
      </swiper-item>
      <swiper-item v-for="img in product.banners" :key="img">
        <image
          class="detail__media"
          :src="img"
          mode="aspectFill"
          @click="previewImage(img)"
        />
      </swiper-item>
    </swiper>

    <!-- 基本信息 -->
    <view class="detail__card">
      <view class="detail__price-row">
        <view>
          <text class="detail__price">{{ formatPrice(currentPrice, true) }}</text>
          <text v-if="currentOriginalPrice > currentPrice" class="detail__price-origin">
            {{ formatPrice(currentOriginalPrice, true) }}
          </text>
        </view>
        <text class="detail__sales">已售{{ product.sales }}</text>
      </view>
      <view class="detail__name">{{ product.name }}</view>
      <view v-if="product.tags.length" class="detail__tags">
        <wd-tag v-for="tag in product.tags" :key="tag" type="primary" plain custom-class="mr-1">
          {{ tag }}
        </wd-tag>
      </view>
    </view>

    <!-- SKU 选择 -->
    <view v-if="product.skus.length" class="detail__card">
      <view class="detail__section-title">选择规格</view>
      <view class="detail__skus">
        <view
          v-for="sku in product.skus"
          :key="sku.id"
          class="detail__sku"
          :class="{
            'detail__sku--active': selectedSkuId === sku.id,
            'detail__sku--disabled': sku.stock <= 0,
          }"
          @click="selectSku(sku)"
        >
          <view>{{ sku.name }}</view>
          <view class="detail__sku-price">{{ formatPrice(sku.price, true) }}</view>
        </view>
      </view>
      <view v-if="selectedSku" class="detail__stock">库存：{{ selectedSku.stock }}</view>
    </view>

    <!-- 产品说明 -->
    <view v-if="product.description" class="detail__card">
      <view class="detail__section-title">产品说明</view>
      <text class="detail__description">{{ product.description }}</text>
    </view>

    <!-- 图文详情 -->
    <view v-if="product.detailHtml" class="detail__card">
      <view class="detail__section-title">图文详情</view>
      <rich-text :nodes="product.detailHtml" />
    </view>

    <template #footer>
      <view class="detail__footer">
        <view class="detail__footer-btn detail__footer-btn--cart" @click="handleAddCart">
          加入购物车
        </view>
        <view class="detail__footer-btn detail__footer-btn--buy" @click="handleBuy">
          立即购买
        </view>
      </view>
    </template>
  </YjPage>
</template>

<script setup lang="ts">
import ProductAPI, { type ProductDetail, type ProductSku } from "@/api/product";
import { formatPrice } from "@/utils/format";

const product = ref<ProductDetail>();
const selectedSkuId = ref("");

const selectedSku = computed(() =>
  product.value?.skus.find((s) => s.id === selectedSkuId.value)
);
const currentPrice = computed(() => selectedSku.value?.price ?? product.value?.price ?? 0);
const currentOriginalPrice = computed(
  () => selectedSku.value?.originalPrice ?? product.value?.originalPrice ?? 0
);

function selectSku(sku: ProductSku): void {
  if (sku.stock <= 0) {
    uni.showToast({ title: "该规格暂时缺货", icon: "none" });
    return;
  }
  selectedSkuId.value = sku.id;
}

function previewImage(current: string): void {
  if (!product.value) return;
  uni.previewImage({ current, urls: product.value.banners });
}

function handleAddCart(): void {
  uni.showToast({ title: "购物车功能即将上线", icon: "none" });
}

function handleBuy(): void {
  uni.showToast({ title: "下单功能即将上线", icon: "none" });
}

onLoad(async (options) => {
  const id = options?.id;
  if (!id) {
    uni.showToast({ title: "商品不存在", icon: "none" });
    return;
  }
  try {
    product.value = await ProductAPI.getDetail(id);
    const firstAvailable = product.value.skus.find((s) => s.stock > 0);
    if (firstAvailable) selectedSkuId.value = firstAvailable.id;
  } catch {
    // 请求层已 toast（商品不存在或已下架）
  }
});
</script>

<style lang="scss" scoped>
.detail {
  &__swiper {
    height: 750rpx;
  }

  &__media {
    width: 100%;
    height: 100%;
  }

  &__card {
    padding: 24rpx;
    margin: 20rpx 24rpx;
    background: #fff;
    border-radius: 16rpx;
  }

  &__price-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }

  &__price {
    font-size: 44rpx;
    font-weight: 600;
    color: #c94f4f;
  }

  &__price-origin {
    margin-left: 16rpx;
    font-size: 26rpx;
    color: #999;
    text-decoration: line-through;
  }

  &__sales {
    font-size: 24rpx;
    color: #999;
  }

  &__name {
    margin-top: 12rpx;
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }

  &__tags {
    margin-top: 12rpx;
  }

  &__section-title {
    margin-bottom: 16rpx;
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
  }

  &__skus {
    display: flex;
    flex-wrap: wrap;
  }

  &__sku {
    min-width: 160rpx;
    padding: 16rpx 24rpx;
    margin: 0 16rpx 16rpx 0;
    font-size: 26rpx;
    color: #333;
    text-align: center;
    background: #f5f5f5;
    border: 2rpx solid transparent;
    border-radius: 12rpx;

    &--active {
      color: #2d5a3d;
      background: rgb(45 90 61 / 8%);
      border-color: #2d5a3d;
    }

    &--disabled {
      color: #ccc;
    }
  }

  &__sku-price {
    margin-top: 4rpx;
    font-size: 24rpx;
    color: #c94f4f;
  }

  &__stock {
    font-size: 24rpx;
    color: #999;
  }

  &__description {
    font-size: 26rpx;
    line-height: 1.6;
    color: #666;
    white-space: pre-wrap;
  }

  &__footer {
    display: flex;
    gap: 20rpx;
    padding: 16rpx 24rpx;
  }

  &__footer-btn {
    flex: 1;
    padding: 20rpx 0;
    font-size: 30rpx;
    font-weight: 500;
    text-align: center;
    border-radius: 44rpx;

    &--cart {
      color: #2d5a3d;
      background: rgb(45 90 61 / 10%);
    }

    &--buy {
      color: #fff;
      background: #2d5a3d;
    }
  }
}
</style>
