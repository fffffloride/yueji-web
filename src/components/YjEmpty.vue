<template>
  <view class="flex flex-col items-center py-15">
    <wd-status-tip :image="image" :tip="text" />
    <slot />
  </view>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    /** wd-status-tip 的图片类型：search / network / content / collect / comment / halo / message / user */
    image?: string;
    text?: string;
  }>(),
  { image: "content", text: "暂无数据" }
);
</script>
