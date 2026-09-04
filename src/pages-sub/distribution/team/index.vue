<template>
  <YjDistributionPage :loading="loading" :error="error" :denied="denied" @retry="load">
    <template v-if="data">
      <view class="distribution-hero"
        ><view class="distribution-caption">直属代理（人）</view
        ><view class="distribution-amount">{{ data.directCount }}</view
        ><view class="distribution-caption"
          >仅展示直属下级，每位成员的业绩为其本人直属有效销售额。</view
        ></view
      >
      <view v-for="agent in data.agents" :key="agent.id" class="distribution-card">
        <view class="distribution-row"
          ><text>{{ agent.realName }}</text
          ><text class="distribution-tag">{{
            AGENT_LABELS[agent.status] || "状态更新中"
          }}</text></view
        >
        <view class="distribution-row"
          ><text class="distribution-caption">该成员直属有效销售额</text
          ><text>{{ formatPrice(agent.directVerifiedSales, true) }}</text></view
        >
      </view>
      <YjEmpty
        v-if="!data.agents.length"
        text="暂无直属代理"
        description="后台配置直属代理关系后，成员会显示在这里"
      />
    </template>
  </YjDistributionPage>
</template>

<script setup lang="ts">
import DistributionAPI from "@/api/distribution";
import { useDistributionPage } from "@/composables/useDistributionPage";
import { AGENT_LABELS } from "@/utils/distribution";
import { formatPrice } from "@/utils/format";
const { data, loading, error, denied, load } = useDistributionPage(DistributionAPI.getTeam, true);
</script>
