import { defineStore } from "pinia";
import UserAPI, { type UserInfo } from "@/api/user";
import { StorageKey } from "@/constants";
import { clearAccessToken, setAccessToken } from "@/utils/auth";
import store from "./index";

export const useUserStore = defineStore(
  "user",
  () => {
    const userInfo = ref<UserInfo>({} as UserInfo);
    const isLoggedIn = computed(() => !!userInfo.value.id);
    const isAgent = computed(() => !!userInfo.value.isAgent);

    /**
     * 微信登录：用 uni.login 的 code 换取 token 与用户信息。
     *
     * @param inviterId - 分享/分销场景带入的推荐人 ID。
     */
    async function login(inviterId?: string) {
      const result = import.meta.env.DEV
        ? await UserAPI.mockLogin({ mobile: "13800138000" })
        : await uni
            .login({ provider: "weixin" })
            .then(({ code }) => UserAPI.login({ code, inviterId }));

      // token 有效期由后端下发，本地缓存同步过期避免带着废 token 请求
      setAccessToken(result.accessToken, result.expiresIn * 1000);
      try {
        return await fetchUserInfo();
      } catch (error) {
        clearAccessToken();
        userInfo.value = {} as UserInfo;
        throw error;
      }
    }

    async function fetchUserInfo() {
      userInfo.value = await UserAPI.getInfo();
      return userInfo.value;
    }

    function logout() {
      clearAccessToken();
      userInfo.value = {} as UserInfo;
    }

    return { userInfo, isLoggedIn, isAgent, login, fetchUserInfo, logout };
  },
  {
    persist: { key: StorageKey.USER_INFO, paths: ["userInfo"] },
  }
);

/** 组件外（工具函数、拦截器等）使用 store 的入口。 */
export function useUserStoreHook() {
  return useUserStore(store);
}
