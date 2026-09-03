<template>
  <YjPage :padded="false">
    <view class="points-page">
      <view class="points-summary">
        <view class="points-summary__eyebrow">当前积分</view>
        <view class="points-summary__balance">{{ account?.points ?? "--" }}</view>
        <view class="points-summary__level">
          {{ account?.level?.name || "悦己会员" }}
        </view>

        <view v-if="account" class="points-summary__rules">
          <view class="points-summary__rule">
            <text class="points-summary__rule-value">{{ account.rule.earnPerYuan }}</text>
            <text>消费1元得积分</text>
          </view>
          <view class="points-summary__rule-line" />
          <view class="points-summary__rule">
            <text class="points-summary__rule-value">{{ account.rule.redeemPointsPerYuan }}</text>
            <text>积分抵1元</text>
          </view>
          <view class="points-summary__rule-line" />
          <view class="points-summary__rule">
            <text class="points-summary__rule-value">{{ maxDeductPercent }}%</text>
            <text>单笔最高抵扣</text>
          </view>
        </view>
      </view>

      <view class="points-detail card">
        <view class="points-detail__header">
          <view>
            <view class="points-detail__title">积分明细</view>
            <view class="points-detail__subtitle">积分变动实时记录</view>
          </view>
          <view v-if="logs.length" class="points-detail__count">共 {{ total }} 条</view>
        </view>

        <view v-if="loading && logs.length === 0" class="points-detail__loading">
          <wd-loading size="48rpx" />
        </view>

        <YjEmpty v-else-if="loadError && logs.length === 0" image="network" :text="loadError">
          <view class="points-detail__retry" @click="loadPage(true)">重新加载</view>
        </YjEmpty>

        <YjEmpty
          v-else-if="logs.length === 0"
          text="暂无积分记录"
          description="完成消费后，积分变化会显示在这里"
        />

        <view v-else class="points-list">
          <view v-for="item in logs" :key="item.id" class="points-list__item">
            <view
              class="points-list__mark"
              :class="item.changePoints > 0 ? 'is-income' : 'is-expense'"
            >
              {{ item.changePoints > 0 ? "+" : "−" }}
            </view>
            <view class="points-list__content">
              <view class="points-list__name">{{ logTitle(item) }}</view>
              <view class="points-list__time">{{ formatDate(item.createTime) }}</view>
            </view>
            <view class="points-list__value-wrap">
              <view
                class="points-list__value"
                :class="item.changePoints > 0 ? 'is-income' : 'is-expense'"
              >
                {{ signedPoints(item.changePoints) }}
              </view>
              <view class="points-list__balance">余额 {{ item.balanceAfter }}</view>
            </view>
          </view>

          <view v-if="loading" class="points-detail__more">加载中...</view>
          <view v-else-if="finished" class="points-detail__more">没有更多了</view>
        </view>
      </view>
    </view>
  </YjPage>
</template>

<script setup lang="ts">
import MarketingAPI, {
  type PointsAccount,
  PointsBizType,
  type PointsLogItem,
} from "@/api/marketing";
import { formatDate as formatDateValue } from "@/utils/format";

const PAGE_SIZE = 10;

const POINTS_BIZ_LABEL: Record<PointsBizType, string> = {
  [PointsBizType.INIT]: "初始积分",
  [PointsBizType.ORDER_DEDUCT]: "订单积分抵扣",
  [PointsBizType.ORDER_CANCEL_RETURN]: "订单取消返还",
  [PointsBizType.ORDER_REFUND_RETURN]: "订单退款返还",
  [PointsBizType.ORDER_EARN]: "消费奖励积分",
};

const account = ref<PointsAccount | null>(null);
const logs = ref<PointsLogItem[]>([]);
const total = ref(0);
const pageNum = ref(1);
const loading = ref(false);
const finished = ref(false);
const loadError = ref("");

let requestSequence = 0;
let isFirstShow = true;

const maxDeductPercent = computed(() => {
  const rate = account.value?.rule.maxDeductRate ?? 0;
  return Number((rate / 100).toFixed(2));
});

function logTitle(item: PointsLogItem): string {
  return item.remark || POINTS_BIZ_LABEL[item.bizType] || "积分变动";
}

function signedPoints(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

function formatDate(value: string): string {
  return formatDateValue(value, "YYYY-MM-DD HH:mm");
}

async function loadPage(reset = false): Promise<void> {
  if (!reset && (loading.value || finished.value)) return;

  const sequence = reset ? ++requestSequence : requestSequence;
  if (reset) {
    pageNum.value = 1;
    finished.value = false;
    loadError.value = "";
    logs.value = [];
  }

  loading.value = true;
  const requestedPage = pageNum.value;
  try {
    const [accountResult, pageResult] = await Promise.all([
      account.value && !reset ? Promise.resolve(account.value) : MarketingAPI.getPointsAccount(),
      MarketingAPI.getPointsPage({ pageNum: requestedPage, pageSize: PAGE_SIZE }),
    ]);
    if (sequence !== requestSequence) return;

    account.value = accountResult;
    logs.value = [...logs.value, ...pageResult.list];
    total.value = pageResult.total;
    finished.value = logs.value.length >= pageResult.total;
    pageNum.value = requestedPage + 1;
  } catch (error) {
    if (sequence !== requestSequence) return;
    loadError.value = error instanceof Error ? error.message : "积分明细加载失败";
  } finally {
    if (sequence === requestSequence) loading.value = false;
  }
}

onLoad(() => {
  void loadPage(true);
});

onShow(() => {
  if (isFirstShow) {
    isFirstShow = false;
    return;
  }
  void loadPage(true);
});

onReachBottom(() => {
  void loadPage();
});

onPullDownRefresh(async () => {
  await loadPage(true);
  uni.stopPullDownRefresh();
});
</script>

<style lang="scss" scoped src="./index.scss"></style>
