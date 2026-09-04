<template>
  <YjDistributionPage
    :loading="loading"
    :error="error"
    :denied="denied"
    :disabled="profile?.agent?.status === 3"
    @retry="load"
  >
    <view class="distribution-notice"
      >支付后生成佣金，核销后进入待结算；已结算金额进入分销钱包，实际打款进度请查看提现记录。</view
    >
    <view class="distribution-card">
      <YjCapsuleTab :model-value="tab" :tabs="tabs" @update:model-value="selectTab" />
      <view class="distribution-actions">
        <picker
          mode="selector"
          :range="['全部层级', '一级佣金', '二级佣金']"
          :value="depth"
          @change="selectDepth"
          ><view class="distribution-picker"
            >{{ ["全部层级", "一级佣金", "二级佣金"][depth] }} ▾</view
          ></picker
        >
      </view>
      <view class="distribution-actions">
        <picker
          class="distribution-picker"
          mode="date"
          :value="startDate"
          :end="endDate || undefined"
          @change="startDate = $event.detail.value"
          ><view>{{ startDate || "支付开始日期" }}</view></picker
        >
        <picker
          class="distribution-picker"
          mode="date"
          :value="endDate"
          :start="startDate || undefined"
          @change="endDate = $event.detail.value"
          ><view>{{ endDate || "支付结束日期" }}</view></picker
        >
      </view>
      <view v-if="filterError" class="distribution-error">{{ filterError }}</view>
      <view class="distribution-actions"
        ><wd-button size="small" @click="applyDates">查询</wd-button
        ><wd-button size="small" plain @click="clearDates">重置日期</wd-button></view
      >
    </view>
    <view v-for="item in list" :key="item.id" class="distribution-card">
      <view class="distribution-row"
        ><text class="distribution-caption">{{ item.orderNo }}</text
        ><text class="distribution-tag">{{
          COMMISSION_LABELS[item.status] || "状态更新中"
        }}</text></view
      >
      <view class="distribution-row"
        ><text>{{ item.depth === 1 ? "一级佣金" : "二级佣金" }}</text
        ><text class="distribution-value">{{
          formatPrice(item.commissionAmount, true)
        }}</text></view
      >
      <view class="distribution-caption">支付时间 {{ item.paidTime || "—" }}</view>
      <button
        class="distribution-link"
        :aria-expanded="expanded === item.id"
        @click="expanded = expanded === item.id ? '' : item.id"
      >
        <text>{{ expanded === item.id ? "收起详情" : "佣金详情" }}</text
        ><wd-icon :name="expanded === item.id ? 'arrow-up' : 'arrow-down'" />
      </button>
      <view v-if="expanded === item.id" class="distribution-details">
        <view>计佣基数：{{ formatPrice(item.baseAmount, true) }}</view
        ><view>佣金比例：{{ item.rateBps / 100 }}%</view>
        <view v-if="item.pendingSettlementTime">核销时间：{{ item.pendingSettlementTime }}</view>
        <view v-if="item.settledTime">结算时间：{{ item.settledTime }}</view>
        <view v-if="item.reversedTime">冲销时间：{{ item.reversedTime }}</view>
      </view>
    </view>
    <YjEmpty
      v-if="!list.length && !isLoading && !listError"
      text="暂无佣金记录"
      description="符合条件的订单支付后，佣金记录会显示在这里"
    />
    <view class="distribution-more"
      ><wd-loading v-if="isLoading" /><template v-else-if="listError"
        ><view class="distribution-error">{{ listError }}</view
        ><wd-button size="small" plain @click="more">重试</wd-button></template
      ><wd-button v-else-if="!isFinished" size="small" plain @click="more">加载更多</wd-button
      ><text v-else-if="list.length">已展示全部 {{ total }} 条记录</text></view
    >
  </YjDistributionPage>
</template>

<script setup lang="ts">
import DistributionAPI from "@/api/distribution";
import { useDistributionPage } from "@/composables/useDistributionPage";
import { useLoadMore } from "@/composables/useLoadMore";
import { COMMISSION_LABELS, dateRangeError } from "@/utils/distribution";
import { formatPrice } from "@/utils/format";

const tabs = ["全部", "待核销", "待结算", "已结算", "已冲销"];
const statuses = [undefined, 0, 1, 3, 2];
const tab = ref(0);
const depth = ref(0);
const startDate = ref("");
const endDate = ref("");
const dates = ref({
  startTime: undefined as string | undefined,
  endTime: undefined as string | undefined,
});
const filterError = ref("");
const expanded = ref("");
const {
  list,
  total,
  isLoading,
  isFinished,
  error: listError,
  refresh,
  loadMore,
} = useLoadMore({
  fetcher: DistributionAPI.getCommissions,
  immediate: false,
  params: () => ({ status: statuses[tab.value], depth: depth.value || undefined, ...dates.value }),
});
const { profile, loading, error, denied, load } = useDistributionPage(() => refresh());
onLoad((options) => {
  if (options?.status !== undefined)
    tab.value = Math.max(0, statuses.indexOf(Number(options.status)));
});
function selectTab(value: number) {
  tab.value = value;
  expanded.value = "";
  void load();
}
function selectDepth(event: { detail: { value: string | number } }) {
  depth.value = Number(event.detail.value);
  void load();
}
function applyDates() {
  filterError.value = dateRangeError(startDate.value, endDate.value);
  if (filterError.value) return;
  dates.value = {
    startTime: startDate.value ? `${startDate.value}T00:00:00+08:00` : undefined,
    endTime: endDate.value ? `${endDate.value}T23:59:59+08:00` : undefined,
  };
  void load();
}
function clearDates() {
  startDate.value = "";
  endDate.value = "";
  applyDates();
}
function more() {
  if (!loading.value && !error.value) void loadMore().catch(() => {});
}
onReachBottom(more);
</script>
