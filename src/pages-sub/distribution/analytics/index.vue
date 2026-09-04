<template>
  <YjDistributionPage
    :loading="loading"
    :error="error"
    :denied="denied"
    :disabled="profile?.agent?.status === 3"
    @retry="load"
  >
    <view class="distribution-card">
      <YjCapsuleTab
        :model-value="tab"
        :tabs="['本月', '上月', '自定义']"
        @update:model-value="selectTab"
      />
      <template v-if="tab === 2">
        <view class="distribution-actions">
          <picker
            class="distribution-picker"
            mode="date"
            :value="startDate"
            :end="endDate || undefined"
            @change="startDate = $event.detail.value"
            ><view>{{ startDate || "开始日期" }}</view></picker
          >
          <picker
            class="distribution-picker"
            mode="date"
            :value="endDate"
            :start="startDate || undefined"
            @change="endDate = $event.detail.value"
            ><view>{{ endDate || "结束日期" }}</view></picker
          >
        </view>
        <view v-if="filterError" class="distribution-error">{{ filterError }}</view>
        <view class="distribution-actions"
          ><wd-button size="small" @click="applyDates">查询业绩</wd-button></view
        >
      </template>
    </view>
    <template v-if="data">
      <view class="distribution-hero">
        <view class="distribution-caption">直属销售额（元）</view
        ><view class="distribution-amount">{{ formatPrice(data.summary.salesAmount) }}</view>
        <view class="distribution-caption">{{ data.startDate }} 至 {{ data.endDate }}</view>
        <view class="distribution-metrics distribution-metrics--two">
          <view
            ><view class="distribution-value">{{ data.summary.orderCount }}</view
            ><text class="distribution-caption">直属订单数（单）</text></view
          >
          <view
            ><view class="distribution-value">{{ data.summary.customerCount }}</view
            ><text class="distribution-caption">直属客户数（人）</text></view
          >
        </view>
      </view>
      <view class="distribution-card">
        <view class="distribution-title">直属销售额趋势</view>
        <view class="distribution-caption"
          >销售额（元） · 按{{ { DAY: "日", MONTH: "月", YEAR: "年" }[data.granularity] }}展示</view
        >
        <scroll-view
          v-if="data.trend.length"
          class="distribution-trend"
          scroll-x
          :show-scrollbar="true"
        >
          <view class="distribution-trend__bars">
            <view
              v-for="point in data.trend"
              :key="point.period"
              class="distribution-trend__column"
              :aria-label="`${point.period} 销售额 ${formatPrice(point.salesAmount)} 元`"
            >
              <view class="distribution-trend__plot"
                ><text class="distribution-trend__value">{{ formatPrice(point.salesAmount) }}</text
                ><view
                  class="distribution-trend__bar"
                  :style="{ height: `${(point.salesAmount / maxSales) * 220}rpx` }"
              /></view>
              <view class="distribution-trend__period">{{
                data.granularity === "DAY" ? point.period.slice(5) : point.period
              }}</view>
            </view>
          </view>
        </scroll-view>
        <view class="distribution-caption"
          >日期（{{ { DAY: "日", MONTH: "月", YEAR: "年" }[data.granularity] }}） ·
          左右滑动查看完整趋势</view
        >
      </view>
      <view class="distribution-notice"
        >按订单核销确认时间统计本人直属业绩，客户数按会员去重。未核销订单不计入，团队间接业绩不计入。</view
      >
    </template>
  </YjDistributionPage>
</template>

<script setup lang="ts">
import DistributionAPI, { type AnalyticsQuery } from "@/api/distribution";
import { useDistributionPage } from "@/composables/useDistributionPage";
import { dateRangeError, monthRange } from "@/utils/distribution";
import { formatPrice } from "@/utils/format";
const tab = ref(0);
const startDate = ref("");
const endDate = ref("");
const filterError = ref("");
const query = ref<AnalyticsQuery>({});
const { profile, data, loading, error, denied, load } = useDistributionPage(() =>
  DistributionAPI.getAnalytics(query.value)
);
const maxSales = computed(() =>
  Math.max(1, ...(data.value?.trend.map((point) => point.salesAmount) || []))
);
function selectTab(value: number) {
  tab.value = value;
  filterError.value = "";
  if (value === 2) {
    startDate.value = data.value?.startDate || monthRange().startDate;
    endDate.value = data.value?.endDate || monthRange().endDate;
    return;
  }
  query.value = value === 0 ? {} : monthRange(true);
  void load();
}
function applyDates() {
  filterError.value =
    dateRangeError(startDate.value, endDate.value) || (!startDate.value ? "请选择完整日期" : "");
  if (filterError.value) return;
  query.value = { startDate: startDate.value, endDate: endDate.value };
  void load();
}
</script>
