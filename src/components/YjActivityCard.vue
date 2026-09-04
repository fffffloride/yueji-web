<template>
  <button class="yj-activity" :aria-label="card.title" @click="emit('click')">
    <image
      v-if="!failed"
      class="yj-activity__image"
      :src="card.imageUrl"
      mode="aspectFill"
      @error="failed = true"
    />
    <wd-icon v-else name="picture" size="48rpx" />
  </button>
</template>

<script setup lang="ts">
import type { HomePromoCard } from "@/api/decoration";
const props = defineProps<{ card: HomePromoCard }>();
const emit = defineEmits<{ (e: "click"): void }>();
const failed = ref(false);
watch(
  () => props.card.imageUrl,
  () => {
    failed.value = false;
  }
);
</script>

<style lang="scss" scoped>
.yj-activity {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 200rpx;
  padding: 0;
  margin: 0;
  overflow: hidden;
  color: $color-text-placeholder;
  background-color: $color-primary-tint;
  border-radius: 24rpx;

  &::after {
    border: none;
  }

  &__image {
    width: 100%;
    height: 100%;
  }
}
</style>
