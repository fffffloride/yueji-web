<template>
  <text class="yj-countdown">{{ formatted }}</text>
</template>

<script setup lang="ts">
/** 时分秒倒计时，展示 HH:MM:SS，归零后停止并抛出 finish。 */
const props = withDefaults(
  defineProps<{
    /** 初始剩余秒数 */
    seconds: number;
  }>(),
  { seconds: 0 }
);

const emit = defineEmits<{
  (e: "finish"): void;
}>();

const remaining = ref(Math.max(0, Math.floor(props.seconds)));
let timer: ReturnType<typeof setInterval> | null = null;

const formatted = computed(() => {
  const h = String(Math.floor(remaining.value / 3600)).padStart(2, "0");
  const m = String(Math.floor((remaining.value % 3600) / 60)).padStart(2, "0");
  const s = String(remaining.value % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
});

onMounted(() => {
  if (remaining.value <= 0) return;
  timer = setInterval(() => {
    remaining.value -= 1;
    if (remaining.value <= 0) {
      remaining.value = 0;
      if (timer) clearInterval(timer);
      emit("finish");
    }
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>
