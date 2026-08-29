<template>
  <YjPage :padded="false" :has-footer="Boolean(quote && !loadError)">
    <view v-if="loading" class="confirm-status">
      <wd-loading />
      <text>正在试算订单</text>
    </view>

    <view v-else-if="loadError || !quote" class="confirm-status">
      <YjEmpty image="network" :text="loadError || '订单试算失败'">
        <wd-button size="small" type="primary" @click="loadCheckout">重新加载</wd-button>
      </YjEmpty>
    </view>

    <template v-else>
      <view v-if="createdOrder" class="confirm-created">
        订单 {{ createdOrder.orderNo }} 已创建，请继续完成支付
      </view>

      <view class="confirm-section">
        <view class="confirm-section__title">项目清单</view>
        <view v-for="item in displayItems" :key="item.skuId" class="confirm-item">
          <image v-if="item.image" class="confirm-item__image" :src="item.image" mode="aspectFill" />
          <view v-else class="confirm-item__image confirm-item__placeholder">悦己</view>
          <view class="confirm-item__content">
            <view class="confirm-item__name">{{ item.name }}</view>
            <view class="confirm-item__sku">{{ item.skuName }}</view>
            <view class="confirm-item__bottom">
              <text>{{ formatPrice(item.price, true) }}</text>
              <text>×{{ item.quantity }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="confirm-section confirm-form">
        <view class="confirm-section__title">联系信息</view>
        <wd-input
          v-model="contactName"
          label="联系人"
          required
          clearable
          maxlength="32"
          placeholder="请输入联系人姓名"
        />
        <wd-input
          v-model="contactMobile"
          label="手机号"
          required
          clearable
          type="tel"
          maxlength="11"
          placeholder="请输入手机号"
        />
        <wd-textarea
          v-model="remark"
          label="备注"
          clearable
          maxlength="255"
          placeholder="如有特殊需求可在此说明"
        />
      </view>

      <view class="confirm-section confirm-price">
        <view class="confirm-section__title">金额明细</view>
        <view class="confirm-price__row">
          <text>商品金额</text>
          <text>{{ formatPrice(quote.totalAmount, true) }}</text>
        </view>
        <view v-if="quote.memberDiscount > 0" class="confirm-price__row confirm-price__discount">
          <text>{{ quote.memberLevelName || "会员" }}优惠</text>
          <text>-{{ formatPrice(quote.memberDiscount, true) }}</text>
        </view>
        <view v-if="quote.discountAmount > quote.memberDiscount" class="confirm-price__row confirm-price__discount">
          <text>其他优惠</text>
          <text>-{{ formatPrice(quote.discountAmount - quote.memberDiscount, true) }}</text>
        </view>
        <view class="confirm-price__row confirm-price__pay">
          <text>应付</text>
          <text>{{ formatPrice(quote.payAmount, true) }}</text>
        </view>
      </view>
    </template>

    <template #footer>
      <view v-if="quote && !loadError" class="confirm-footer">
        <view class="confirm-footer__amount">
          <text>应付</text>
          <text>{{ formatPrice(quote.payAmount, true) }}</text>
        </view>
        <wd-button type="primary" :loading="submitting" :disabled="submitting" @click="submit">
          {{ createdOrder ? "继续支付" : quote.payAmount === 0 ? "确认订单" : "提交订单" }}
        </wd-button>
      </view>
    </template>
  </YjPage>
</template>

<script setup lang="ts">
import OrderAPI, { type OrderDetail, type OrderForm, type OrderQuote } from "@/api/order";
import PayAPI from "@/api/pay";
import ProductAPI from "@/api/product";
import { RoutePath } from "@/constants";
import { useCartStore } from "@/stores/cart";
import { useUserStore } from "@/stores/user";
import { parseCheckoutSource, type CheckoutSource } from "@/utils/checkout";
import { formatPrice } from "@/utils/format";
import { navigate } from "@/utils/navigate";

interface DisplayItem {
  skuId: string;
  name: string;
  skuName: string;
  image: string;
  price: number;
  quantity: number;
}

const cartStore = useCartStore();
const userStore = useUserStore();
const source = ref<CheckoutSource>();
const displayItems = ref<DisplayItem[]>([]);
const quote = ref<OrderQuote>();
const createdOrder = ref<OrderDetail>();
const contactName = ref("");
const contactMobile = ref("");
const remark = ref("");
const loading = ref(false);
const submitting = ref(false);
const loadError = ref("");
const routeOptions = ref<Record<string, string>>({});

async function loadDisplayItems() {
  if (!source.value) return;
  if ("cartIds" in source.value) {
    await cartStore.fetch();
    const ids = new Set(source.value.cartIds);
    const rows = cartStore.items.filter((item) => ids.has(item.id) && !item.invalid);
    if (rows.length !== ids.size) throw new Error("部分购物车项目已失效，请返回购物车重试");
    displayItems.value = rows.map((item) => ({
      skuId: item.skuId,
      name: item.productName,
      skuName: item.skuName,
      image: item.productImage,
      price: item.price,
      quantity: item.quantity,
    }));
    return;
  }

  const productId = routeOptions.value.productId;
  if (!productId) throw new Error("项目参数不完整");
  const product = await ProductAPI.getDetail(productId);
  const requested = source.value.items[0];
  const sku = product.skus.find((item) => item.id === requested.skuId);
  if (!sku || sku.stock < requested.quantity) throw new Error("所选规格已失效或库存不足");
  displayItems.value = [
    {
      skuId: sku.id,
      name: product.name,
      skuName: sku.name,
      image: product.cover,
      price: sku.price,
      quantity: requested.quantity,
    },
  ];
}

async function loadCheckout() {
  if (loading.value) return;
  loading.value = true;
  loadError.value = "";
  try {
    source.value = parseCheckoutSource(routeOptions.value);
    if (!userStore.userInfo.id) await userStore.fetchUserInfo();
    contactName.value ||= userStore.userInfo.nickname || "";
    contactMobile.value ||= userStore.userInfo.phone || "";
    await loadDisplayItems();
    quote.value = await OrderAPI.quote(source.value);
  } catch (error) {
    quote.value = undefined;
    loadError.value = error instanceof Error ? error.message : "订单试算失败";
  } finally {
    loading.value = false;
  }
}

function validateContact(): boolean {
  if (!contactName.value.trim()) {
    uni.showToast({ title: "请填写联系人", icon: "none" });
    return false;
  }
  if (!/^1\d{10}$/.test(contactMobile.value.trim())) {
    uni.showToast({ title: "请填写正确的手机号", icon: "none" });
    return false;
  }
  return true;
}

async function continuePayment(order: OrderDetail) {
  if (order.payAmount === 0) {
    navigate(RoutePath.ORDER_PAY_RESULT, {
      redirect: true,
      params: { orderNo: order.orderNo, success: 1 },
    });
    return;
  }
  const payment = await PayAPI.create(order.id);
  navigate(RoutePath.ORDER_PAY_RESULT, {
    redirect: true,
    params: { paymentNo: payment.paymentNo, orderNo: order.orderNo },
  });
}

async function submit() {
  if (submitting.value || !source.value || !quote.value || !validateContact()) return;
  submitting.value = true;
  try {
    if (!createdOrder.value) {
      const form: OrderForm = {
        ...source.value,
        contactName: contactName.value.trim(),
        contactMobile: contactMobile.value.trim(),
        remark: remark.value.trim() || undefined,
      };
      createdOrder.value = await OrderAPI.create(form);
      if ("cartIds" in source.value) await cartStore.fetch();
    }
    await continuePayment(createdOrder.value);
  } finally {
    submitting.value = false;
  }
}

onLoad((options) => {
  routeOptions.value = (options ?? {}) as Record<string, string>;
  void loadCheckout();
});
</script>

<style lang="scss" scoped>
.confirm-status {
  display: flex;
  gap: $spacing-sm;
  align-items: center;
  justify-content: center;
  min-height: 640rpx;
  color: $color-text-sub;
}

.confirm-created {
  padding: $spacing-md $page-padding;
  font-size: $font-size-sm;
  color: $color-primary;
  background: #edf6ef;
}

.confirm-section {
  padding: $spacing-lg $page-padding;
  margin-bottom: $spacing-md;
  background: $color-bg;

  &__title {
    margin-bottom: $spacing-md;
    font-size: $font-size-lg;
    font-weight: 700;
    color: $color-text-title;
  }
}

.confirm-item {
  display: flex;
  gap: $spacing-md;
  padding: $spacing-md 0;
  border-bottom: 1rpx solid $color-line;

  &:last-child {
    border-bottom: 0;
  }

  &__image {
    display: flex;
    flex: 0 0 156rpx;
    align-items: center;
    justify-content: center;
    width: 156rpx;
    height: 156rpx;
    background: $color-bg-page;
    border-radius: $radius-input;
  }

  &__placeholder {
    font-size: $font-size-sm;
    color: $color-primary;
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-weight: 600;
    color: $color-text-title;

    @include ellipsis-multi(2);
  }

  &__sku {
    margin-top: $spacing-xs;
    font-size: $font-size-sm;
    color: $color-text-sub;
  }

  &__bottom {
    display: flex;
    justify-content: space-between;
    margin-top: $spacing-md;
    font-weight: 600;
  }
}

.confirm-price {
  &__row {
    display: flex;
    justify-content: space-between;
    padding: $spacing-sm 0;
    color: $color-text-content;
  }

  &__discount {
    color: $color-primary;
  }

  &__pay {
    padding-top: $spacing-md;
    margin-top: $spacing-sm;
    font-size: $font-size-lg;
    font-weight: 700;
    color: $color-text-title;
    border-top: 1rpx solid $color-line;
  }
}

.confirm-footer {
  display: flex;
  gap: $spacing-md;
  align-items: center;
  justify-content: space-between;

  &__amount {
    display: flex;
    flex-direction: column;
    font-size: $font-size-xs;
    color: $color-text-sub;

    text:last-child {
      font-size: $font-size-lg;
      font-weight: 700;
      color: $color-price;
    }
  }
}
</style>
