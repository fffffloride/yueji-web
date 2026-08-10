<template>
  <YjPage :tabbar="RoutePath.PRODUCT">
    <YjPlaceholder
      title="产品中心"
      section="3.3"
      :points="[
        '顶部搜索框，点击进入搜索页',
        '左侧一级分类 + 右侧商品列表布局',
        '支持三级分类结构与自定义商品分组',
        '列表 / 网格视图切换，销量、价格、新品排序',
      ]"
    />
  </YjPage>
</template>

<script setup lang="ts">
import { RoutePath } from "@/constants";
</script>
