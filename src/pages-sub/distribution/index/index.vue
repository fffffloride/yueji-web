<template>
  <YjDistributionPage
    :loading="loading"
    :error="error"
    :denied="denied"
    :disabled="profile?.agent?.status === 3"
    @retry="load"
  >
    <template v-if="profile?.agent && data">
      <view class="distribution-row">
        <view>
          <view class="distribution-title">{{ profile.agent.realName }}</view>
          <view class="distribution-caption"
            >{{ profile.agent.typeName || "代理商" }} ·
            {{ profile.agent.levelName || "暂无等级" }}</view
          >
        </view>
        <text class="distribution-tag">{{ AGENT_LABELS[profile.agent.status] }}</text>
      </view>
      <view class="distribution-hero">
        <view class="distribution-caption">可提现金额（元）</view>
        <view class="distribution-amount">{{
          data.account ? formatPrice(data.account.availableAmount) : "—"
        }}</view>
        <view v-if="!data.account" class="distribution-caption">资金信息暂时无法加载</view>
        <wd-button block @click="open(RoutePath.DISTRIBUTION_WALLET)">{{
          data.account?.withdrawalMode === "APPLY" ? "去提现" : "查看分销钱包"
        }}</wd-button>
        <view class="distribution-metrics">
          <button class="distribution-stat" @click="openCommission(0)">
            <view class="distribution-value">{{
              data.account ? formatPrice(data.account.waitingVerifyAmount) : "—"
            }}</view
            ><text>待核销佣金</text>
          </button>
          <button class="distribution-stat" @click="openCommission(1)">
            <view class="distribution-value">{{
              data.account ? formatPrice(data.account.pendingSettlementAmount) : "—"
            }}</view
            ><text>待结算佣金</text>
          </button>
          <button class="distribution-stat" @click="open(RoutePath.DISTRIBUTION_WALLET)">
            <view class="distribution-value">{{
              data.account ? formatPrice(data.account.frozenAmount) : "—"
            }}</view
            ><text>提现处理中</text>
          </button>
        </view>
      </view>
      <view class="distribution-card">
        <button class="distribution-link" @click="open(RoutePath.DISTRIBUTION_ANALYTICS)">
          <text>本月直属业绩</text><wd-icon name="chevron-right" />
        </button>
        <view class="distribution-metrics">
          <view
            ><view class="distribution-value">{{
              data.analytics ? formatPrice(data.analytics.summary.salesAmount) : "—"
            }}</view
            ><text class="distribution-caption">销售额（元）</text></view
          >
          <view
            ><view class="distribution-value">{{ data.analytics?.summary.orderCount ?? "—" }}</view
            ><text class="distribution-caption">订单数（单）</text></view
          >
          <view
            ><view class="distribution-value">{{
              data.analytics?.summary.customerCount ?? "—"
            }}</view
            ><text class="distribution-caption">客户数（人）</text></view
          >
        </view>
        <view class="distribution-caption">{{
          data.analytics ? "按订单核销确认时间统计" : "业绩暂时无法加载，点击查看后重试"
        }}</view>
      </view>
      <view class="distribution-card">
        <button
          v-for="entry in entries"
          :key="entry.path"
          class="distribution-link"
          @click="open(entry.path)"
        >
          <text>{{ entry.label }}</text
          ><wd-icon name="chevron-right" />
        </button>
      </view>
    </template>
  </YjDistributionPage>
</template>

<script setup lang="ts">
import DistributionAPI from "@/api/distribution";
import { useDistributionPage } from "@/composables/useDistributionPage";
import { RoutePath } from "@/constants";
import { AGENT_LABELS } from "@/utils/distribution";
import { formatPrice } from "@/utils/format";
import { navigate } from "@/utils/navigate";

const { profile, data, loading, error, denied, load } = useDistributionPage(async () => {
  const [account, analytics] = await Promise.allSettled([
    DistributionAPI.getAccount(),
    DistributionAPI.getAnalytics(),
  ]);
  return {
    account: account.status === "fulfilled" ? account.value : null,
    analytics: analytics.status === "fulfilled" ? analytics.value : null,
  };
});
const entries = computed(() => [
  { label: "佣金明细", path: RoutePath.DISTRIBUTION_COMMISSION },
  { label: "分销钱包", path: RoutePath.DISTRIBUTION_WALLET },
  ...(profile.value?.agent?.status === 1
    ? [{ label: "我的团队", path: RoutePath.DISTRIBUTION_TEAM }]
    : []),
  { label: "销售业绩", path: RoutePath.DISTRIBUTION_ANALYTICS },
  { label: "销售任务", path: RoutePath.DISTRIBUTION_TASK },
  { label: "代理资料", path: RoutePath.DISTRIBUTION_MERCHANT },
]);
function open(path: string) {
  navigate(path, { requireAuth: true });
}
function openCommission(status: number) {
  navigate(RoutePath.DISTRIBUTION_COMMISSION, { requireAuth: true, params: { status } });
}
</script>
