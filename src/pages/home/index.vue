<template>
  <YjPage :tabbar="RoutePath.HOME">
    <YjPlaceholder
      title="首页"
      section="3.2"
      :points="[
        '顶部区域：搜索栏、消息入口、城市定位',
        'Banner 轮播广告',
        '通知公告横向滚动',
        '功能入口九宫格：兑换码 / 医生预约 / 积分商城 / 拼团 / 大转盘 / 客服 / 分销中心',
        '悦己营销活动专区：医生团队、免费预约面诊、预约日历、月度主题、新人礼',
        '品牌背书图片展示',
        '商品推荐区：明星单品 / 热销 / 新品',
        '右下角悬浮客服入口（跳企微）',
      ]"
    />
  </YjPage>
</template>

<script setup lang="ts">
import { RoutePath } from "@/constants";

onPullDownRefresh(() => {
  uni.stopPullDownRefresh();
});
</script>
