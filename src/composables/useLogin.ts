import { RoutePath } from "@/constants";
import { useUserStore } from "@/stores/user";
import { isLoggedIn } from "@/utils/auth";
import { toLogin } from "@/utils/navigate";

/** 登录相关的通用流程，供登录页与需要登录态的业务页复用。 */
export function useLogin() {
  const userStore = useUserStore();
  const isSubmitting = ref(false);

  /**
   * 执行微信登录，成功后回到来源页。
   *
   * @param from - 登录成功后要跳回的页面路径，省略则回首页。
   * @param inviterId - 分销场景带入的推荐人 ID。
   */
  async function handleLogin(from?: string, inviterId?: string) {
    if (isSubmitting.value) return;

    isSubmitting.value = true;
    try {
      await userStore.login(inviterId);
      if (from) {
        uni.redirectTo({ url: from, fail: () => uni.switchTab({ url: RoutePath.HOME }) });
      } else {
        uni.switchTab({ url: RoutePath.HOME });
      }
    } finally {
      isSubmitting.value = false;
    }
  }

  /**
   * 校验登录态，未登录时跳登录页。
   *
   * @param from - 登录成功后的回跳地址。
   * @returns 是否已登录。
   */
  function ensureLogin(from?: string): boolean {
    if (isLoggedIn()) return true;
    toLogin(from);
    return false;
  }

  return { isSubmitting: readonly(isSubmitting), handleLogin, ensureLogin };
}
