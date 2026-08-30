<template>
  <YjPage has-footer>
    <YjPlaceholder
      title="购物车"
      section="3.4"
      :points="[
        '商品多选、左滑删除、编辑模式批量操作',
        '空购物车状态与推荐商品',
        '底部结算栏：全选、合计金额、去结算',
      ]"
    />

    <YjEmpty v-if="!cartStore.items.length" image="collect" text="购物车还是空的" />

    <template #footer>
      <view class="cart-footer">
        <wd-checkbox
          :model-value="cartStore.isAllChecked"
          @change="cartStore.toggleAllChecked(!cartStore.isAllChecked)"
        >
          全选
        </wd-checkbox>
        <view class="cart-footer__total">
          合计
          <text class="text-price">{{ formatPrice(cartStore.checkedAmount, true) }}</text>
        </view>
        <wd-button type="primary" :disabled="!cartStore.checkedItems.length">去结算</wd-button>
      </view>
    </template>
  </YjPage>
</template>

<script setup lang="ts">
import { useCartStore } from "@/stores/cart";
import { formatPrice } from "@/utils/format";

const cartStore = useCartStore();
</script>

<style lang="scss" scoped>
.cart-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cart-footer__total {
  margin-right: $spacing-md;
  margin-left: auto;
  font-size: $font-size-sm;
  color: $color-text-sub;
}
</style>
