<template>
  <YjPage :tabbar="RoutePath.APPOINTMENT">
    <YjPlaceholder
      title="预约"
      section="3.8"
      :points="[
        '医生列表：按大师 / 注射 / 光电分类筛选',
        '免费预约面诊入口',
        '预约日历：选择日期与时间段',
        '不同 SKU 对应不同预约间隔',
      ]"
    />
  </YjPage>
</template>

<script setup lang="ts">
import { RoutePath } from "@/constants";
</script>
