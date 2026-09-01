<template>
  <YjPage :padded="false">
    <view class="coupon-page">
      <view class="coupon-page__tabs">
        <view
          v-for="tab in tabs"
          :key="tab.key"
          class="coupon-page__tab"
          :class="{ 'is-active': activeTab === tab.key }"
          @click="selectTab(tab.key)"
        >
          {{ tab.label }}
        </view>
      </view>

      <view class="coupon-page__content">
        <view v-if="loading && coupons.length === 0" class="coupon-page__loading">
          <wd-loading size="48rpx" />
        </view>

        <YjEmpty v-else-if="loadError && coupons.length === 0" image="network" :text="loadError">
          <view class="coupon-page__retry" @click="fetchCoupons(true)">重新加载</view>
        </YjEmpty>

        <YjEmpty v-else-if="coupons.length === 0" :text="emptyText" />

        <template v-else>
          <YjCouponCard
            v-for="coupon in coupons"
            :key="coupon.id"
            :value="couponValue(coupon)"
            :value-prefix="couponValuePrefix(coupon)"
            :value-suffix="couponValueSuffix(coupon)"
            :condition="couponCondition(coupon)"
            :name="coupon.name"
            :type-label="COUPON_TYPE_LABEL[coupon.type]"
            :scope-label="COUPON_SCOPE_LABEL[coupon.scopeType]"
            :valid-range="couponValidRange(coupon)"
            :action-label="couponActionLabel(coupon)"
            :action-disabled="!couponActionable(coupon) || actionCouponId === coupon.id"
            :muted="coupon.status === CouponStatusEnum.USED || coupon.status === CouponStatusEnum.EXPIRED"
            @action="handleCouponAction(coupon)"
          />

          <view v-if="loading" class="coupon-page__more">加载中...</view>
          <view v-else-if="finished" class="coupon-page__more">没有更多了</view>
        </template>
      </view>
    </view>
  </YjPage>
</template>

<script setup lang="ts">
import MarketingAPI, {
  type ClaimableCoupon,
  type MemberCouponItem,
} from "@/api/marketing";
import { RoutePath } from "@/constants";
import {
  COUPON_SCOPE_LABEL,
  COUPON_STATUS_LABEL,
  COUPON_TYPE_LABEL,
  CouponScopeTypeEnum,
  CouponStatusEnum,
  CouponTypeEnum,
} from "@/enums/coupon";
import { formatDate, formatPrice } from "@/utils/format";
import { navigate } from "@/utils/navigate";

const PAGE_SIZE = 10;
const CLAIMABLE_TAB = "CLAIMABLE" as const;
type CouponTab = typeof CLAIMABLE_TAB | CouponStatusEnum;

interface CouponListItem {
  id: string;
  couponId: string;
  name: string;
  type: CouponTypeEnum;
  scopeType: CouponScopeTypeEnum;
  thresholdAmount: number;
  discountAmount: number;
  discountRate: number;
  maxDiscountAmount?: number | null;
  validStart?: string | null;
  validEnd?: string | null;
  status?: CouponStatusEnum;
  isClaimable: boolean;
}

const tabs: Array<{ key: CouponTab; label: string }> = [
  { key: CLAIMABLE_TAB, label: "可领取" },
  { key: CouponStatusEnum.UNUSED, label: COUPON_STATUS_LABEL[CouponStatusEnum.UNUSED] },
  { key: CouponStatusEnum.USED, label: COUPON_STATUS_LABEL[CouponStatusEnum.USED] },
  { key: CouponStatusEnum.EXPIRED, label: COUPON_STATUS_LABEL[CouponStatusEnum.EXPIRED] },
];

const coupons = ref<CouponListItem[]>([]);
const activeTab = ref<CouponTab>(CLAIMABLE_TAB);
const loading = ref(false);
const finished = ref(false);
const pageNum = ref(1);
const loadError = ref("");
const actionCouponId = ref("");

let requestSequence = 0;
let isFirstShow = true;

const emptyText = computed(() => {
  const label = tabs.find((tab) => tab.key === activeTab.value)?.label ?? "相关";
  return `暂无${label}优惠券`;
});

function normalizeClaimable(item: ClaimableCoupon): CouponListItem {
  return {
    id: item.id,
    couponId: item.id,
    name: item.name,
    type: item.type,
    scopeType: item.scopeType,
    thresholdAmount: item.thresholdAmount,
    discountAmount: item.discountAmount,
    discountRate: item.discountRate,
    maxDiscountAmount: item.maxDiscountAmount,
    validStart: item.validStart,
    validEnd: item.validEnd,
    isClaimable: true,
  };
}

function normalizeMine(item: MemberCouponItem): CouponListItem {
  return {
    id: item.id,
    couponId: item.couponId,
    name: item.couponName || "优惠券",
    type: item.couponType ?? CouponTypeEnum.FULL_REDUCTION,
    scopeType: item.scopeType ?? CouponScopeTypeEnum.ALL,
    thresholdAmount: item.thresholdAmount,
    discountAmount: item.discountAmount,
    discountRate: item.discountRate,
    maxDiscountAmount: item.maxDiscountAmount,
    validStart: item.validStart,
    validEnd: item.validEnd,
    status: item.status,
    isClaimable: false,
  };
}

async function fetchCoupons(reset = false): Promise<void> {
  if (!reset && (loading.value || finished.value)) return;

  const sequence = reset ? ++requestSequence : requestSequence;
  if (reset) {
    pageNum.value = 1;
    finished.value = false;
    loadError.value = "";
    coupons.value = [];
  }

  loading.value = true;
  const requestedPage = pageNum.value;
  try {
    const params = { pageNum: requestedPage, pageSize: PAGE_SIZE };
    const result =
      activeTab.value === CLAIMABLE_TAB
        ? await MarketingAPI.getClaimable(params)
        : await MarketingAPI.getMyCoupons({ ...params, status: activeTab.value });
    if (sequence !== requestSequence) return;

    const list =
      activeTab.value === CLAIMABLE_TAB
        ? (result.list as ClaimableCoupon[]).map(normalizeClaimable)
        : (result.list as MemberCouponItem[]).map(normalizeMine);
    coupons.value = [...coupons.value, ...list];
    finished.value = coupons.value.length >= result.total;
    pageNum.value = requestedPage + 1;
  } catch (error) {
    if (sequence !== requestSequence) return;
    loadError.value = error instanceof Error ? error.message : "优惠券加载失败";
  } finally {
    if (sequence === requestSequence) loading.value = false;
  }
}

function selectTab(tab: CouponTab): void {
  if (activeTab.value === tab) return;
  activeTab.value = tab;
  void fetchCoupons(true);
}

function couponValue(coupon: CouponListItem): string {
  if (coupon.type === CouponTypeEnum.DISCOUNT) {
    return (coupon.discountRate / 1000).toFixed(coupon.discountRate % 1000 ? 1 : 0);
  }
  if (coupon.type === CouponTypeEnum.EXCHANGE) return "兑换";
  return formatPrice(coupon.discountAmount).replace(/\.00$/, "");
}

function couponValuePrefix(coupon: CouponListItem): string {
  return coupon.type === CouponTypeEnum.FULL_REDUCTION ? "¥" : "";
}

function couponValueSuffix(coupon: CouponListItem): string {
  return coupon.type === CouponTypeEnum.DISCOUNT ? "折" : "";
}

function couponCondition(coupon: CouponListItem): string {
  if (coupon.type === CouponTypeEnum.EXCHANGE) return "指定项目兑换";
  if (coupon.thresholdAmount <= 0) return "无门槛";
  return `满${formatPrice(coupon.thresholdAmount)}元可用`;
}

function couponDate(value?: string | null): string {
  return value ? formatDate(value.slice(0, 10), "YYYY.MM.DD") : "";
}

function couponValidRange(coupon: CouponListItem): string {
  const start = couponDate(coupon.validStart);
  const end = couponDate(coupon.validEnd);
  return start && end ? `有效期 ${start} - ${end}` : "有效期以使用时为准";
}

function couponActionLabel(coupon: CouponListItem): string {
  if (coupon.isClaimable) return actionCouponId.value === coupon.id ? "领取中" : "领取";
  if (coupon.status === CouponStatusEnum.UNUSED) return "去使用";
  return COUPON_STATUS_LABEL[coupon.status ?? CouponStatusEnum.EXPIRED];
}

function couponActionable(coupon: CouponListItem): boolean {
  return coupon.isClaimable || coupon.status === CouponStatusEnum.UNUSED;
}

async function handleCouponAction(coupon: CouponListItem): Promise<void> {
  if (!couponActionable(coupon) || actionCouponId.value) return;
  if (!coupon.isClaimable) {
    navigate(RoutePath.PRODUCT);
    return;
  }

  actionCouponId.value = coupon.id;
  try {
    await MarketingAPI.claim(coupon.couponId);
    uni.showToast({ title: "领取成功", icon: "success" });
    await fetchCoupons(true);
  } finally {
    actionCouponId.value = "";
  }
}

onLoad((options) => {
  const tab = options?.status === CLAIMABLE_TAB ? CLAIMABLE_TAB : Number(options?.status);
  if (tabs.some((item) => item.key === tab)) activeTab.value = tab as CouponTab;
  void fetchCoupons(true);
});

onShow(() => {
  if (isFirstShow) {
    isFirstShow = false;
    return;
  }
  void fetchCoupons(true);
});

onReachBottom(() => {
  void fetchCoupons();
});

onPullDownRefresh(async () => {
  await fetchCoupons(true);
  uni.stopPullDownRefresh();
});
</script>

<style lang="scss" scoped src="./index.scss"></style>
