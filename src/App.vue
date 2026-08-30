<script setup lang="ts">
import { useAppStore } from "@/stores/app";
import { trackCurrentPageVisit } from "@/utils/visit-tracker";

const appStore = useAppStore();

onLaunch(() => {
  appStore.initSystemInfo();
});

onShow(() => {
  trackCurrentPageVisit();
});
</script>
