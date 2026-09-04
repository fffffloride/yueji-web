<template>
  <YjDistributionPage
    :loading="loading"
    :error="error"
    :denied="denied"
    :disabled="profile?.agent?.status === 3"
    @retry="load"
  >
    <template v-if="account">
      <view class="distribution-hero">
        <view class="distribution-caption">可提现金额（元）</view>
        <view class="distribution-amount">{{ formatPrice(account.availableAmount) }}</view>
        <wd-button
          v-if="account.withdrawalMode === 'APPLY'"
          block
          :disabled="account.availableAmount <= 0"
          @click="openDrawer"
          >申请提现</wd-button
        >
        <view v-else class="distribution-caption"
          >系统按结算规则生成提现申请，审核通过后由财务处理打款。</view
        >
      </view>
      <view class="distribution-card">
        <view class="distribution-metrics">
          <view
            ><view class="distribution-value">{{ formatPrice(account.frozenAmount) }}</view
            ><text class="distribution-caption">冻结金额（元）</text></view
          >
          <view
            ><view class="distribution-value">{{ formatPrice(account.settledTotal) }}</view
            ><text class="distribution-caption">累计已结算（元）</text></view
          >
          <view
            ><view class="distribution-value">{{ formatPrice(account.paidAmount) }}</view
            ><text class="distribution-caption">累计已打款（元）</text></view
          >
        </view>
        <view class="distribution-caption"
          >待审核与待打款金额均冻结；申请驳回后释放至可提现余额。</view
        >
        <view class="distribution-details">
          <view>结算周期：{{ CYCLE_LABELS[account.cycleType] }}</view>
          <view>下次结算日期：{{ account.nextSettlementDate?.slice(0, 10) || "—" }}</view>
          <view>单笔提现上限：{{ formatPrice(account.singleLimitAmount, true) }}</view>
          <view>结算后进入可用余额，实际到账以打款结果为准。</view>
        </view>
      </view>
      <view class="distribution-card"
        ><view class="distribution-title">提现记录</view
        ><YjCapsuleTab :model-value="tab" :tabs="tabs" @update:model-value="selectTab"
      /></view>
      <view v-for="item in list" :key="item.id" class="distribution-card">
        <view class="distribution-row"
          ><text class="distribution-value">{{ formatPrice(item.amount, true) }}</text
          ><text class="distribution-tag">{{
            WITHDRAWAL_LABELS[item.status] || "状态更新中"
          }}</text></view
        >
        <view class="distribution-caption"
          >{{ item.createTime }} ·
          {{ item.sourceMode === "AUTO" ? "系统自动申请" : "本人申请" }}</view
        >
        <button
          class="distribution-link"
          :aria-expanded="expanded === item.id"
          @click="expanded = expanded === item.id ? '' : item.id"
        >
          <text>{{ expanded === item.id ? "收起详情" : "查看进度" }}</text
          ><wd-icon :name="expanded === item.id ? 'arrow-up' : 'arrow-down'" />
        </button>
        <view v-if="expanded === item.id" class="distribution-details">
          <view>提现编号：{{ item.withdrawalNo }}</view>
          <view v-if="item.reviewTime">审核时间：{{ item.reviewTime }}</view>
          <view v-if="item.reviewReason">审核说明：{{ item.reviewReason }}</view>
          <view v-if="item.paidTime">打款时间：{{ item.paidTime }}</view>
          <view v-if="item.transferNo">转账流水：{{ item.transferNo }}</view>
          <view v-if="item.paidRemark">打款说明：{{ item.paidRemark }}</view>
          <view v-if="item.status === 0">申请已提交，等待后台审核。</view>
          <view v-if="item.status === 1">审核已通过，等待财务打款。</view>
          <view v-if="item.status === 2">本次申请金额已释放，可核对原因后重新申请。</view>
        </view>
      </view>
      <YjEmpty
        v-if="!list.length && !isLoading && !listError"
        text="暂无提现记录"
        description="提交提现申请后，可在这里查看处理进度"
      />
      <view class="distribution-more"
        ><wd-loading v-if="isLoading" /><template v-else-if="listError"
          ><view class="distribution-error">{{ listError }}</view
          ><wd-button size="small" plain @click="more">重试</wd-button></template
        ><wd-button v-else-if="!isFinished" size="small" plain @click="more">加载更多</wd-button
        ><text v-else-if="list.length">已展示全部记录</text></view
      >
    </template>
  </YjDistributionPage>
  <wd-popup
    v-model="drawerOpen"
    position="bottom"
    root-portal
    safe-area-inset-bottom
    :z-index="1100"
    :close-on-click-modal="!submitting"
    custom-style="border-radius: 28rpx 28rpx 0 0;"
  >
    <view v-if="account" class="distribution-drawer">
      <view class="distribution-row"
        ><text class="distribution-title">申请提现</text
        ><wd-button size="small" type="text" :disabled="submitting" @click="drawerOpen = false"
          >关闭</wd-button
        ></view
      >
      <view class="distribution-caption"
        >可提现 {{ formatPrice(account.availableAmount, true) }}，单笔上限
        {{ formatPrice(account.singleLimitAmount, true) }}</view
      >
      <input
        v-model="amount"
        class="distribution-input"
        type="digit"
        :disabled="submitting"
        :maxlength="14"
        placeholder="请输入提现金额（元）"
        aria-label="提现金额（元）"
      />
      <wd-button
        size="small"
        plain
        :disabled="submitting"
        @click="amount = formatPrice(Math.min(account.availableAmount, account.singleLimitAmount))"
        >全部提现</wd-button
      >
      <view v-if="submitError" class="distribution-error">{{ submitError }}</view>
      <view class="distribution-details"
        >提交后金额将冻结，审核通过后由财务处理打款。请确认金额后提交。</view
      >
      <view class="distribution-actions"
        ><wd-button block :loading="submitting" :disabled="submitting" @click="submit"
          >确认申请</wd-button
        ></view
      >
    </view>
  </wd-popup>
</template>

<script setup lang="ts">
import DistributionAPI from "@/api/distribution";
import { useDistributionPage } from "@/composables/useDistributionPage";
import { useLoadMore } from "@/composables/useLoadMore";
import { CYCLE_LABELS, WITHDRAWAL_LABELS, withdrawalCents } from "@/utils/distribution";
import { formatPrice } from "@/utils/format";

const tabs = ["全部", "待审核", "待打款", "已驳回", "已打款"];
const tab = ref(0);
const expanded = ref("");
const drawerOpen = ref(false);
const amount = ref("");
const submitError = ref("");
const submitting = ref(false);
const {
  list,
  isLoading,
  isFinished,
  error: listError,
  refresh,
  loadMore,
} = useLoadMore({
  fetcher: DistributionAPI.getWithdrawals,
  immediate: false,
  params: () => ({ status: tab.value === 0 ? undefined : tab.value - 1 }),
});
const {
  profile,
  data: account,
  loading,
  error,
  denied,
  load,
} = useDistributionPage(async () => {
  const result = await DistributionAPI.getAccount();
  await refresh().catch(() => {});
  return result;
});
watch(loading, (value) => {
  if (value) drawerOpen.value = false;
});
function selectTab(value: number) {
  tab.value = value;
  expanded.value = "";
  void load();
}
function more() {
  if (!loading.value && !error.value) void loadMore().catch(() => {});
}
function openDrawer() {
  amount.value = "";
  submitError.value = "";
  drawerOpen.value = true;
}
async function submit() {
  if (submitting.value || !account.value) return;
  submitError.value = "";
  let cents: number;
  try {
    cents = withdrawalCents(
      amount.value,
      account.value.availableAmount,
      account.value.singleLimitAmount
    );
  } catch (cause) {
    submitError.value = (cause as Error).message;
    return;
  }
  submitting.value = true;
  try {
    await DistributionAPI.withdraw(cents);
    drawerOpen.value = false;
    tab.value = 0;
    await load();
    uni.showToast({ title: "申请已提交，等待审核", icon: "none" });
  } catch (cause) {
    // POST 超时可能已入账；先核对资金和记录，不自动重试申请。
    drawerOpen.value = false;
    tab.value = 0;
    await load();
    await uni.showModal({
      title: "请核对提现记录",
      content: `${cause instanceof Error ? cause.message : "提交结果未确认"}。请先核对提现记录和余额，确认未提交成功后再操作。`,
      showCancel: false,
    });
  } finally {
    submitting.value = false;
  }
}
onReachBottom(more);
</script>
