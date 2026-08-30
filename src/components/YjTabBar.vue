<template>
  <wd-tabbar
    :model-value="activeIndex"
    fixed
    placeholder
    safe-area-inset-bottom
    active-color="#2D5A3D"
    inactive-color="#999999"
    @change="handleChange"
  >
    <wd-tabbar-item
      v-for="(tab, index) in tabs"
      :key="tab.path"
      :name="index"
      :title="tab.title"
      :icon="tab.icon"
    />
  </wd-tabbar>
</template>

<script setup lang="ts">
import { RoutePath, TAB_BAR_PATHS } from "@/constants";

interface TabItem {
  /** wd-icon 内置图标名 */
  icon: string;
  title: string;
  path: string;
}

const props = defineProps<{
  /** 当前页面路径，取 RoutePath 中的值 */
  current: string;
}>();

const tabs: TabItem[] = [
  { icon: "home", title: "首页", path: RoutePath.HOME },
  { icon: "bags", title: "项目", path: RoutePath.PRODUCT },
  { icon: "gift", title: "券包", path: RoutePath.COUPON },
  { icon: "user", title: "我的", path: RoutePath.MINE },
];

const activeIndex = computed(() => {
  const index = TAB_BAR_PATHS.indexOf(props.current);
  return index === -1 ? 0 : index;
});

function handleChange({ value }: { value: number }) {
  const target = tabs[value];
  if (!target || target.path === props.current) return;
  uni.switchTab({ url: target.path });
}

// 原生 tabBar 只用于让 switchTab 可用，视觉上由本组件接管。
// hideTabBar 是全局且持久的，首个 TabBar 页面挂载时隐藏一次即可。
onMounted(() => {
  uni.hideTabBar({ animation: false, fail: () => undefined });
});
</script>
