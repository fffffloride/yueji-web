<template>
  <YjPage
    :tabbar="RoutePath.CART"
    :has-footer="loggedIn && cartStore.items.length > 0"
    :padded="false"
  >
    <view v-if="cartStore.loading && !cartStore.items.length" class="cart__status">
      <wd-loading />
      <text>正在加载购物车</text>
    </view>

    <view v-else-if="!loggedIn" class="cart__empty">
      <YjEmpty image="user" text="登录后查看购物车">
        <wd-button size="small" type="primary" @click="toCartLogin">去登录</wd-button>
      </YjEmpty>
    </view>

    <view v-else-if="!cartStore.items.length" class="cart__empty">
      <YjEmpty image="collect" text="购物车还是空的">
        <wd-button size="small" type="primary" @click="goShopping">去选项目</wd-button>
      </YjEmpty>
    </view>

    <view v-else class="cart__list">
      <view
        v-for="item in cartStore.items"
        :key="item.id"
        class="cart-item"
        :class="{ 'cart-item--invalid': item.invalid }"
      >
        <wd-checkbox
          :model-value="item.checked"
          :disabled="item.invalid || busyId === item.id"
          @change="handleChecked(item, $event.value)"
        />
        <image
          class="cart-item__image"
          :src="item.productImage"
          mode="aspectFill"
          @click="openProduct(item)"
        />
        <view class="cart-item__content">
          <view class="cart-item__info" @click="openProduct(item)">
            <view class="cart-item__name">{{ item.productName }}</view>
            <view class="cart-item__sku">{{ item.skuName }}</view>
            <view v-if="item.invalid" class="cart-item__invalid">商品或规格已失效</view>
            <view v-else-if="item.stock <= 0" class="cart-item__invalid">暂时缺货</view>
          </view>
          <view class="cart-item__bottom">
            <text class="cart-item__price">{{ formatPrice(item.price, true) }}</text>
            <wd-input-number
              :model-value="item.quantity"
              :min="1"
              :max="Math.max(1, item.stock)"
              :disabled="item.invalid || busyId === item.id"
              :input-width="56"
              @change="handleQuantity(item, $event.value)"
            />
          </view>
          <text class="cart-item__remove" @click="handleRemove(item)">删除</text>
        </view>
      </view>
    </view>

    <template #footer>
      <view v-if="loggedIn && cartStore.items.length" class="cart-footer">
        <wd-checkbox
          :model-value="cartStore.isAllChecked"
          :disabled="cartStore.loading || !!busyId"
          @change="handleToggleAll($event.value)"
        >
          全选
        </wd-checkbox>
        <view class="cart-footer__total">
          <text>合计</text>
          <text class="cart-footer__price">{{ formatPrice(cartStore.checkedAmount, true) }}</text>
        </view>
        <wd-button
          type="primary"
          :disabled="!cartStore.checkedItems.length || cartStore.loading || !!busyId"
          @click="handleCheckout"
        >
          去结算
        </wd-button>
      </view>
    </template>
  </YjPage>
</template>

<script setup lang="ts">
import type { CartItem } from "@/api/cart";
import { RoutePath } from "@/constants";
import { useCartStore } from "@/stores/cart";
import { formatPrice } from "@/utils/format";
import { isLoggedIn } from "@/utils/auth";
import { navigate, toLogin } from "@/utils/navigate";

const cartStore = useCartStore();
const loggedIn = ref(isLoggedIn());
const busyId = ref("");

async function runForItem(id: string, action: () => Promise<void>) {
  if (busyId.value) return;
  busyId.value = id;
  try {
    await action();
  } finally {
    busyId.value = "";
  }
}

function toCartLogin() {
  toLogin(RoutePath.CART);
}

function goShopping() {
  navigate(RoutePath.PRODUCT);
}

function openProduct(item: CartItem) {
  navigate(RoutePath.PRODUCT_DETAIL, { params: { id: item.productId } });
}

function handleChecked(item: CartItem, checked: boolean) {
  void runForItem(item.id, () => cartStore.toggleChecked(item.id, checked));
}

function handleQuantity(item: CartItem, value: number | string) {
  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity === item.quantity) return;
  void runForItem(item.id, () => cartStore.updateQuantity(item.id, quantity));
}

async function handleRemove(item: CartItem) {
  const { confirm } = await uni.showModal({ title: "删除项目", content: "确认从购物车删除？" });
  if (confirm) await runForItem(item.id, () => cartStore.remove(item.id));
}

async function handleToggleAll(checked: boolean) {
  if (busyId.value) return;
  busyId.value = "all";
  try {
    await cartStore.toggleAllChecked(checked);
  } finally {
    busyId.value = "";
  }
}

function handleCheckout() {
  const cartIds = cartStore.checkedItems.map((item) => item.id).join(",");
  navigate(RoutePath.ORDER_CONFIRM, {
    requireAuth: true,
    params: { cartIds },
  });
}

onShow(() => {
  loggedIn.value = isLoggedIn();
  if (loggedIn.value) void cartStore.fetch();
  else cartStore.clear();
});
</script>

<style lang="scss" scoped>
.cart {
  &__status {
    display: flex;
    gap: $spacing-sm;
    align-items: center;
    justify-content: center;
    min-height: 360rpx;
    color: $color-text-sub;
  }

  &__empty {
    padding-top: 120rpx;
  }

  &__list {
    padding: $spacing-md $page-padding;
  }
}

.cart-item {
  position: relative;
  display: flex;
  gap: $spacing-md;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
  background: $color-bg;
  border-radius: $radius-card;

  &--invalid {
    opacity: 0.7;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(.wd-checkbox) {
    align-self: center;
  }

  &__image {
    flex: 0 0 176rpx;
    width: 176rpx;
    height: 176rpx;
    background: $color-bg-page;
    border-radius: $radius-input;
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__name {
    padding-right: 64rpx;
    font-size: $font-size-md;
    font-weight: 600;
    color: $color-text-title;

    @include ellipsis-multi(2);
  }

  &__sku {
    margin-top: $spacing-xs;
    font-size: $font-size-sm;
    color: $color-text-sub;
  }

  &__invalid {
    margin-top: $spacing-xs;
    font-size: $font-size-xs;
    color: $color-danger;
  }

  &__bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: $spacing-md;
  }

  &__price {
    font-size: $font-size-md;
    font-weight: 600;
    color: $color-price;
  }

  &__remove {
    position: absolute;
    top: $spacing-md;
    right: $spacing-md;
    font-size: $font-size-xs;
    color: $color-text-placeholder;
  }
}

.cart-footer {
  display: flex;
  gap: $spacing-md;
  align-items: center;

  &__total {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: flex-end;
    font-size: $font-size-xs;
    color: $color-text-sub;
  }

  &__price {
    font-size: $font-size-lg;
    font-weight: 700;
    color: $color-price;
  }
}
</style>
