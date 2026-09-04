<template>
  <YjDistributionPage
    :loading="loading"
    :error="error"
    :denied="denied"
    :disabled="profile?.agent?.status === 3"
    @retry="load"
  >
    <template v-if="data">
      <view class="distribution-card">
        <view class="distribution-title">{{ data.name }}</view>
        <view class="distribution-actions"
          ><text class="distribution-tag">{{ TASK_LABELS[data.displayStatus] }}</text
          ><text v-if="data.completed" class="distribution-tag">已达标</text></view
        >
        <view class="distribution-details"
          ><view>开始时间：{{ data.startTime }}</view
          ><view>结束时间：{{ data.endTime }}</view></view
        >
      </view>
      <view class="distribution-card">
        <view class="distribution-title">{{
          data.metricType === "SALES_AMOUNT" ? "直属销售额目标" : "直属订单数目标"
        }}</view>
        <view class="distribution-value"
          >{{ taskValue(data.currentValue, data.metricType) }} /
          {{ taskValue(data.targetValue, data.metricType) }}</view
        >
        <view
          class="distribution-progress"
          role="progressbar"
          :aria-valuenow="data.progressRateBps / 100"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="任务完成进度"
          ><view
            class="distribution-progress__fill"
            :style="{ width: `${data.progressRateBps / 100}%` }"
        /></view>
        <view class="distribution-caption">完成进度 {{ data.progressRateBps / 100 }}%</view>
        <view class="distribution-details"
          >统计任务有效期内已核销的本人直属业绩。已取消的任务停止新增业绩计入，已达标状态与任务有效期分别展示。</view
        >
      </view>
      <view v-if="data.description" class="distribution-card"
        ><view class="distribution-title">任务说明</view
        ><view class="distribution-description">{{ data.description }}</view></view
      >
    </template>
  </YjDistributionPage>
</template>

<script setup lang="ts">
import DistributionAPI from "@/api/distribution";
import { useDistributionPage } from "@/composables/useDistributionPage";
import { TASK_LABELS, taskValue } from "@/utils/distribution";
const id = ref("");
onLoad((options) => {
  id.value = options?.id || "";
});
const { profile, data, loading, error, denied, load } = useDistributionPage(() => {
  if (!/^\d+$/.test(id.value)) throw new Error("任务不存在，请从销售任务列表重新进入");
  return DistributionAPI.getTask(id.value);
});
</script>
