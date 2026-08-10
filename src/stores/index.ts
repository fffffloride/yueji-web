import { createPinia } from "pinia";
import { createPersistedState } from "pinia-plugin-persistedstate";

const store = createPinia();

// 小程序没有 localStorage，统一走 uni 的同步存储 API
store.use(
  createPersistedState({
    storage: {
      getItem: (key: string) => (uni.getStorageSync(key) as string) || null,
      setItem: (key: string, value: string) => uni.setStorageSync(key, value),
    },
  })
);

export default store;
