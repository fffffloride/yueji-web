import { defineStore } from "pinia";
import store from "./index";

export const useAppStore = defineStore("app", () => {
  const systemInfo = ref<UniApp.GetSystemInfoResult>({} as UniApp.GetSystemInfoResult);
  /** 当前城市，需求 3.2.2 顶部区域展示用 */
  const city = ref("上海市");

  /** 状态栏高度（px），自定义导航栏需要用它做顶部占位。 */
  const statusBarHeight = computed(() => systemInfo.value.statusBarHeight ?? 0);
  /** 底部安全区高度（px）。 */
  const safeAreaBottom = computed(() => {
    const { screenHeight = 0, safeArea } = systemInfo.value;
    return safeArea ? screenHeight - safeArea.bottom : 0;
  });

  function initSystemInfo() {
    systemInfo.value = uni.getSystemInfoSync();
  }

  function setCity(value: string) {
    city.value = value;
  }

  return { systemInfo, city, statusBarHeight, safeAreaBottom, initSystemInfo, setCity };
});

export function useAppStoreHook() {
  return useAppStore(store);
}
