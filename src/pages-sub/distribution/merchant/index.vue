<template>
  <YjDistributionPage
    :loading="loading"
    :error="error"
    :denied="denied"
    :disabled="profile?.agent?.status === 3"
    @retry="load"
  >
    <template v-if="profile?.agent">
      <view class="distribution-card">
        <view class="distribution-title">代理身份</view>
        <view class="distribution-row"
          ><text class="distribution-caption">姓名</text
          ><text>{{ profile.agent.realName }}</text></view
        >
        <view class="distribution-row"
          ><text class="distribution-caption">代理类型</text
          ><text>{{ profile.agent.typeName || "—" }}</text></view
        >
        <view class="distribution-row"
          ><text class="distribution-caption">分销等级</text
          ><text>{{ profile.agent.levelName || "—" }}</text></view
        >
        <view class="distribution-row"
          ><text class="distribution-caption">当前状态</text
          ><text>{{ AGENT_LABELS[profile.agent.status] }}</text></view
        >
      </view>
      <view class="distribution-card">
        <view class="distribution-title">联系信息</view>
        <view class="distribution-row"
          ><text class="distribution-caption">手机号</text
          ><text>{{ profile.agent.mobile || "未配置" }}</text></view
        >
        <view class="distribution-row"
          ><text class="distribution-caption">微信号</text
          ><text>{{ profile.agent.wechat || "未配置" }}</text></view
        >
        <view v-if="profile.agent.contactRemark" class="distribution-details">{{
          profile.agent.contactRemark
        }}</view>
      </view>
      <view v-if="profile.agent.status === 1" class="distribution-card">
        <view class="distribution-title">推荐邀请码</view>
        <view class="distribution-row"
          ><text class="distribution-value">{{ profile.agent.inviteCode }}</text
          ><wd-button size="small" plain @click="copyCode">复制</wd-button></view
        >
        <view class="distribution-caption">用于客户绑定推荐关系，代理身份由后台配置。</view>
      </view>
      <view class="distribution-caption"
        >代理身份与联系资料由后台统一管理，如需调整请联系运营人员。</view
      >
    </template>
  </YjDistributionPage>
</template>

<script setup lang="ts">
import { useDistributionPage } from "@/composables/useDistributionPage";
import { AGENT_LABELS } from "@/utils/distribution";
const { profile, loading, error, denied, load } = useDistributionPage(async () => null);
function copyCode() {
  if (profile.value?.agent?.status !== 1) return;
  uni.setClipboardData({
    data: profile.value.agent.inviteCode,
    fail: () => uni.showToast({ title: "复制失败，请重试", icon: "none" }),
  });
}
</script>
