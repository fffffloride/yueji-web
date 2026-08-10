<script setup lang="ts">
import { useAppStore } from "@/stores/app";

const appStore = useAppStore();

onLaunch(() => {
  appStore.initSystemInfo();
});
</script>
