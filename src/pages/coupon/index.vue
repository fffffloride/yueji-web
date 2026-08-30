<template>
  <YjPage>
    <YjPlaceholder
      title="券包"
      section="3.7"
      :points="[
        '优惠券列表：未使用 / 已使用 / 已过期',
        '新人 350 元券领取与使用',
        '优惠券详情与使用规则',
        '兑换码入口',
      ]"
    />

    <view class="coupon-list">
      <view v-for="coupon in coupons" :key="coupon.id" class="coupon card">
        <view class="coupon__left">
          <text class="coupon__symbol">¥</text>
          <text class="coupon__amount">{{ coupon.amount }}</text>
        </view>
        <view class="coupon__info">
          <view class="coupon__name">{{ coupon.name }}</view>
          <view class="coupon__desc">{{ coupon.desc }}</view>
          <view class="coupon__date">有效期至 {{ coupon.expireAt }}</view>
        </view>
        <view class="coupon__action" :class="{ 'coupon__action--disabled': coupon.status !== 'usable' }">
          {{ coupon.status === "usable" ? "去使用" : "已过期" }}
        </view>
      </view>
    </view>
  </YjPage>
</template>

<script setup lang="ts">
/** 券包骨架阶段使用静态示例数据，后续替换为优惠券接口。 */
const coupons = [
  {
    id: 1,
    amount: "350",
    name: "新人专享券",
    desc: "全场项目通用，满 1000 元可用",
    expireAt: "2026-09-30",
    status: "usable",
  },
  {
    id: 2,
    amount: "100",
    name: "到店礼遇券",
    desc: "水光抗衰类项目可用，满 500 元可用",
    expireAt: "2026-08-31",
    status: "usable",
  },
];
</script>

<style lang="scss" scoped>
.coupon-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.coupon {
  display: flex;
  align-items: center;
}

.coupon__left {
  display: flex;
  flex-shrink: 0;
  align-items: baseline;
  margin-right: $spacing-md;
  color: $color-primary;
}

.coupon__symbol {
  font-size: $font-size-sm;
  font-weight: bold;
}

.coupon__amount {
  font-size: 64rpx;
  font-weight: bold;
  line-height: 1;
}

.coupon__info {
  flex: 1;
  min-width: 0;
}

.coupon__name {
  font-size: $font-size-md;
  font-weight: 500;
  color: $color-text-title;
}

.coupon__desc {
  margin-top: $spacing-xs;
  font-size: $font-size-xs;
  color: $color-text-sub;
}

.coupon__date {
  margin-top: $spacing-xs;
  font-size: $font-size-xs;
  color: $color-text-placeholder;
}

.coupon__action {
  flex-shrink: 0;
  padding: $spacing-sm $spacing-md;
  margin-left: $spacing-sm;
  font-size: $font-size-sm;
  color: $color-bg;
  background-color: $color-primary;
  border-radius: $radius-button;
}

.coupon__action--disabled {
  color: $color-text-placeholder;
  background-color: $color-bg-page;
}
</style>
