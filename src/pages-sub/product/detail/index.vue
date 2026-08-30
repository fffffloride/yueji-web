<template>
  <YjPage :padded="false" :has-footer="!!product">
    <view class="detail-nav" :style="{ paddingTop: `${statusBarHeight}px` }">
      <view class="detail-nav__back" @click="goBack()">
        <wd-icon name="arrow-left" size="44rpx" />
      </view>
    </view>

    <view v-if="loading" class="detail-status">
      <wd-loading />
      <text>正在加载项目</text>
    </view>

    <view v-else-if="loadError || !product" class="detail-status">
      <YjEmpty image="network" :text="loadError || '项目不存在'">
        <wd-button size="small" type="primary" @click="loadProduct">重新加载</wd-button>
      </YjEmpty>
    </view>

    <template v-else>
      <swiper
        v-if="product.video || product.banners.length"
        class="detail-hero"
        indicator-dots
        circular
        indicator-color="rgba(255,255,255,.55)"
        indicator-active-color="#ffffff"
      >
        <swiper-item v-if="product.video">
          <video class="detail-hero__media" :src="product.video" object-fit="cover" />
        </swiper-item>
        <swiper-item v-for="image in product.banners" :key="image">
          <image
            v-if="!failedImages.includes(image)"
            class="detail-hero__media"
            :src="image"
            mode="aspectFill"
            @click="previewImage(image)"
            @error="markImageFailed(image)"
          />
          <view v-else class="detail-hero__placeholder">悦己 · DLumière</view>
        </swiper-item>
      </swiper>
      <view v-else class="detail-hero detail-hero__placeholder">悦己 · DLumière</view>

      <view class="price-band">
        <view class="price-band__label">悦己价</view>
        <view class="price-band__main">
          <view class="price-band__price-row">
            <text class="price-band__caption">售价</text>
            <text class="price-band__price">{{ formatPrice(currentPrice, true) }}</text>
            <text v-if="currentOriginalPrice > currentPrice" class="price-band__origin">
              {{ formatPrice(currentOriginalPrice, true) }}
            </text>
          </view>
          <view v-if="savingAmount > 0" class="price-band__saving">
            已优惠 {{ formatPrice(savingAmount, true) }}
          </view>
        </view>
      </view>

      <view class="detail-info">
        <view class="detail-info__name">{{ product.name }}</view>
        <view v-if="product.subTitle" class="detail-info__subtitle">{{ product.subTitle }}</view>
        <view class="detail-info__meta">
          <text>已售 {{ product.sales }} 份</text>
          <text v-if="product.stock > 0">库存 {{ product.stock }}</text>
        </view>
        <view v-if="product.tags.length" class="detail-info__tags">
          <text v-for="tag in product.tags" :key="tag" class="detail-info__tag">{{ tag }}</text>
        </view>
      </view>

      <view class="detail-section detail-sku">
        <view class="detail-section__title">项目</view>
        <view class="detail-sku__list">
          <view
            v-for="sku in product.skus"
            :key="sku.id"
            class="detail-sku__option"
            :class="{
              'detail-sku__option--active': selectedSkuId === sku.id,
              'detail-sku__option--disabled': sku.stock <= 0,
            }"
            @click="selectSku(sku)"
          >
            <view>
              <view class="detail-sku__name">{{ sku.name }}</view>
              <view class="detail-sku__stock">
                {{ sku.stock > 0 ? `剩余 ${sku.stock}` : "暂时缺货" }}
              </view>
            </view>
            <text class="detail-sku__price">{{ formatPrice(sku.price, true) }}</text>
          </view>
        </view>

        <view v-if="selectedSku" class="detail-sku__summary">
          <view class="detail-sku__summary-title">
            <text>{{ selectedSku.name }}</text>
            <text>×1</text>
          </view>
          <view class="detail-sku__summary-row">
            <text>规格</text>
            <text>{{ selectedSku.name }}</text>
          </view>
        </view>
      </view>

      <view v-if="product.detailHtml" class="detail-section">
        <view class="detail-section__title">项目介绍</view>
        <rich-text class="detail-rich" :nodes="product.detailHtml" />
      </view>

      <view v-if="product.description" class="detail-section">
        <view class="detail-section__title">购买说明</view>
        <text class="detail-note">{{ product.description }}</text>
      </view>
    </template>

    <template #footer>
      <view v-if="product" class="detail-footer">
        <view class="detail-footer__cart" @click="navigate(RoutePath.CART)">
          <wd-badge :model-value="cartStore.totalCount || null" :max="99">
            <wd-icon name="cart" size="44rpx" />
          </wd-badge>
          <text>购物车</text>
        </view>
        <wd-button
          class="detail-footer__button"
          type="primary"
          plain
          :disabled="!canBuy || !!submitting"
          :loading="submitting === 'cart'"
          @click="handleAddCart"
        >
          加入购物车
        </wd-button>
        <wd-button
          class="detail-footer__button"
          type="primary"
          :disabled="!canBuy || !!submitting"
          @click="handleBuy"
        >
          立即购买
        </wd-button>
      </view>
    </template>
  </YjPage>
</template>

<script setup lang="ts">
import ProductAPI, { type ProductDetail, type ProductSku } from "@/api/product";
import { RoutePath } from "@/constants";
import { useLogin } from "@/composables/useLogin";
import { useCartStore } from "@/stores/cart";
import { formatPrice } from "@/utils/format";
import { goBack, navigate } from "@/utils/navigate";

const product = ref<ProductDetail>();
const productId = ref("");
const selectedSkuId = ref("");
const failedImages = ref<string[]>([]);
const loading = ref(false);
const loadError = ref("");
const submitting = ref<"" | "cart" | "buy">("");
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight ?? 0;
const cartStore = useCartStore();
const { ensureLogin } = useLogin();

const selectedSku = computed(() =>
  product.value?.skus.find((sku) => sku.id === selectedSkuId.value)
);
const currentPrice = computed(() => selectedSku.value?.price ?? product.value?.price ?? 0);
const currentOriginalPrice = computed(
  () => selectedSku.value?.originalPrice ?? product.value?.originalPrice ?? currentPrice.value
);
const savingAmount = computed(() =>
  Math.max(0, currentOriginalPrice.value - currentPrice.value)
);
const canBuy = computed(() => Boolean(selectedSku.value && selectedSku.value.stock > 0));

function selectSku(sku: ProductSku) {
  if (sku.stock <= 0) {
    uni.showToast({ title: "该规格暂时缺货", icon: "none" });
    return;
  }
  selectedSkuId.value = sku.id;
}

function previewImage(current: string) {
  if (!product.value) return;
  const urls = product.value.banners.filter((image) => !failedImages.value.includes(image));
  if (urls.length) uni.previewImage({ current, urls });
}

function markImageFailed(image: string) {
  if (!failedImages.value.includes(image)) failedImages.value.push(image);
}

async function loadProduct() {
  if (!productId.value || loading.value) return;
  loading.value = true;
  loadError.value = "";
  try {
    product.value = await ProductAPI.getDetail(productId.value);
    selectedSkuId.value = product.value.skus.find((sku) => sku.stock > 0)?.id ?? "";
  } catch (error) {
    product.value = undefined;
    loadError.value = error instanceof Error ? error.message : "项目加载失败";
  } finally {
    loading.value = false;
  }
}

function ensureDetailLogin(): boolean {
  const from = `${RoutePath.PRODUCT_DETAIL}?id=${encodeURIComponent(productId.value)}`;
  return ensureLogin(from);
}

async function handleAddCart() {
  if (!selectedSku.value || submitting.value || !ensureDetailLogin()) return;
  submitting.value = "cart";
  try {
    await cartStore.add(selectedSku.value.id, 1);
    uni.showToast({ title: "已加入购物车", icon: "success" });
  } finally {
    submitting.value = "";
  }
}

function handleBuy() {
  if (!selectedSku.value || submitting.value) return;
  submitting.value = "buy";
  navigate(RoutePath.ORDER_CONFIRM, {
    requireAuth: true,
    params: { productId: productId.value, skuId: selectedSku.value.id, quantity: 1 },
  });
  submitting.value = "";
}

onLoad((options) => {
  productId.value = options?.id ?? "";
  if (!productId.value) {
    loadError.value = "项目不存在";
    return;
  }
  void loadProduct();
});
</script>

<style lang="scss" scoped>
.detail-nav {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 5;
  pointer-events: none;

  &__back {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 68rpx;
    height: 68rpx;
    margin: 12rpx 0 0 $page-padding;
    color: $color-text-title;
    pointer-events: auto;
    background: rgb(255 255 255 / 78%);
    backdrop-filter: blur(10rpx);
    border-radius: 50%;
  }
}

.detail-status {
  display: flex;
  gap: $spacing-sm;
  align-items: center;
  justify-content: center;
  min-height: 720rpx;
  color: $color-text-sub;
}

.detail-hero {
  height: 620rpx;
  background: linear-gradient(145deg, #eef4ef, #d9e7dc);

  &__media {
    width: 100%;
    height: 100%;
  }

  &__placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: $font-size-lg;
    font-weight: 600;
    color: $color-primary;
  }
}

.price-band {
  display: flex;
  min-height: 108rpx;
  background: #edf6ef;

  &__label {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 112rpx;
    font-size: $font-size-md;
    font-weight: 700;
    color: #fff;
    background: $color-primary-dark;
  }

  &__main {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    padding: $spacing-sm $spacing-md;
  }

  &__price-row {
    display: flex;
    gap: $spacing-xs;
    align-items: baseline;
  }

  &__caption {
    font-size: $font-size-sm;
    color: $color-text-content;
  }

  &__price {
    font-size: 44rpx;
    font-weight: 800;
    color: $color-text-title;
  }

  &__origin {
    font-size: $font-size-sm;
    color: $color-text-sub;
    text-decoration: line-through;
  }

  &__saving {
    align-self: flex-start;
    padding: 2rpx $spacing-xs;
    font-size: $font-size-xs;
    color: $color-primary;
    border: 1rpx solid $color-primary-lighter;
  }
}

.detail-info {
  padding: $spacing-lg $page-padding;
  background: $color-bg;

  &__name {
    font-size: 42rpx;
    font-weight: 800;
    line-height: 1.3;
    color: $color-text-title;
  }

  &__subtitle {
    margin-top: $spacing-sm;
    font-size: $font-size-md;
    color: $color-text-content;
  }

  &__meta {
    display: flex;
    gap: $spacing-lg;
    margin-top: $spacing-md;
    font-size: $font-size-sm;
    color: $color-text-sub;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-xs;
    margin-top: $spacing-md;
  }

  &__tag {
    padding: 4rpx 12rpx;
    font-size: $font-size-xs;
    color: $color-primary;
    background: rgb(45 90 61 / 8%);
    border-radius: $radius-tag;
  }
}

.detail-section {
  padding: $spacing-lg $page-padding;
  margin-top: 16rpx;
  background: $color-bg;

  &__title {
    margin-bottom: $spacing-lg;
    font-size: $font-size-lg;
    font-weight: 800;
    color: $color-text-title;
  }
}

.detail-sku {
  &__list {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  &__option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 96rpx;
    padding: $spacing-sm $spacing-md;
    border: 2rpx solid $color-border;

    &--active {
      background: rgb(45 90 61 / 4%);
      border-color: $color-primary;
    }

    &--disabled {
      color: $color-text-disabled;
      background: $color-bg-page;
    }
  }

  &__name {
    font-size: $font-size-md;
    font-weight: 600;
  }

  &__stock {
    margin-top: 4rpx;
    font-size: $font-size-xs;
    color: $color-text-placeholder;
  }

  &__price {
    font-size: $font-size-md;
    font-weight: 600;
  }

  &__summary {
    margin-top: $spacing-lg;
    background: $color-bg-page;
    border: 1rpx solid $color-line;
  }

  &__summary-title,
  &__summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-md;
  }

  &__summary-title {
    font-weight: 600;
    border-bottom: 1rpx solid $color-line;
  }

  &__summary-row {
    gap: $spacing-lg;
    justify-content: flex-start;
    color: $color-text-sub;
  }
}

.detail-rich {
  display: block;
  width: 100%;
  overflow: hidden;
  font-size: $font-size-md;
  line-height: 1.7;
  color: $color-text-content;

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(img) {
    max-width: 100% !important;
    height: auto !important;
  }
}

.detail-note {
  font-size: $font-size-md;
  line-height: 1.8;
  color: $color-text-sub;
  white-space: pre-wrap;
}

.detail-footer {
  display: flex;
  gap: $spacing-sm;
  align-items: center;

  &__cart {
    display: flex;
    flex: 0 0 88rpx;
    flex-direction: column;
    gap: 2rpx;
    align-items: center;
    font-size: $font-size-xs;
    color: $color-text-content;
  }

  &__button {
    flex: 1;
  }
}
</style>
