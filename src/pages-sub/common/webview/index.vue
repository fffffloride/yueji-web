<template>
  <web-view v-if="url" :src="url" />
</template>

<script setup lang="ts">
const url = ref("");

onLoad((options) => {
  url.value = decodeURIComponent(options?.url ?? "");
  if (options?.title) {
    uni.setNavigationBarTitle({ title: decodeURIComponent(options.title) });
  }
});
</script>
