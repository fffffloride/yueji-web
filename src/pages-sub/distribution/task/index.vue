<template>
  <YjDistributionPage
    :loading="loading"
    :error="error"
    :denied="denied"
    :disabled="profile?.agent?.status === 3"
    @retry="load"
  >
    <view class="distribution-card"
      ><YjCapsuleTab
        :model-value="tab"
        :tabs="['全部', '未开始', '进行中', '已结束', '已取消']"
        @update:model-value="selectTab"
    /></view>
    <view v-for="task in list" :key="task.id" class="distribution-card">
      <view class="distribution-row"
        ><text class="distribution-title">{{ task.name }}</text
        ><text class="distribution-tag">{{ TASK_LABELS[task.displayStatus] }}</text></view
      >
      <view class="distribution-caption"
        >{{ task.startTime?.slice(0, 16) }} 至 {{ task.endTime?.slice(0, 16) }}</view
      >
      <view class="distribution-row"
        ><text>{{ task.metricType === "SALES_AMOUNT" ? "直属销售额" : "直属订单数" }}</text
        ><text v-if="task.completed" class="distribution-tag">已达标</text></view
      >
      <view class="distribution-value"
        >{{ taskValue(task.currentValue, task.metricType) }} /
        {{ taskValue(task.targetValue, task.metricType) }}</view
      >
      <view
        class="distribution-progress"
        role="progressbar"
        :aria-valuenow="task.progressRateBps / 100"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-label="task.name"
        ><view
          class="distribution-progress__fill"
          :style="{ width: `${task.progressRateBps / 100}%` }"
      /></view>
      <view class="distribution-caption">完成进度 {{ task.progressRateBps / 100 }}%</view>
      <button class="distribution-link" @click="openTask(task.id)">
        <text>查看任务</text><wd-icon name="chevron-right" />
      </button>
    </view>
    <YjEmpty
      v-if="!list.length && !isLoading && !listError"
      text="暂无销售任务"
      description="运营分配任务后，可在这里查看目标和进度"
    />
    <view class="distribution-more"
      ><wd-loading v-if="isLoading" /><template v-else-if="listError"
        ><view class="distribution-error">{{ listError }}</view
        ><wd-button size="small" plain @click="more">重试</wd-button></template
      ><wd-button v-else-if="!isFinished" size="small" plain @click="more">加载更多</wd-button
      ><text v-else-if="list.length">已展示全部任务</text></view
    >
  </YjDistributionPage>
</template>

<script setup lang="ts">
import DistributionAPI, { type TaskStatus } from "@/api/distribution";
import { useDistributionPage } from "@/composables/useDistributionPage";
import { useLoadMore } from "@/composables/useLoadMore";
import { RoutePath } from "@/constants";
import { TASK_LABELS, taskValue } from "@/utils/distribution";
import { navigate } from "@/utils/navigate";
const tab = ref(0);
const statuses: (TaskStatus | undefined)[] = [
  undefined,
  "NOT_STARTED",
  "IN_PROGRESS",
  "FINISHED",
  "CANCELLED",
];
const {
  list,
  isLoading,
  isFinished,
  error: listError,
  refresh,
  loadMore,
} = useLoadMore({
  fetcher: DistributionAPI.getTasks,
  immediate: false,
  params: () => ({ displayStatus: statuses[tab.value] }),
});
const { profile, loading, error, denied, load } = useDistributionPage(() => refresh());
function selectTab(value: number) {
  tab.value = value;
  void load();
}
function more() {
  if (!loading.value && !error.value) void loadMore().catch(() => {});
}
function openTask(id: string) {
  navigate(RoutePath.DISTRIBUTION_TASK_DETAIL, { requireAuth: true, params: { id } });
}
onReachBottom(more);
</script>
