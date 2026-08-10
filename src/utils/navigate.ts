import { RoutePath, TAB_BAR_PATHS } from "@/constants";
import { useUserStore } from "@/stores/user";
import { isLoggedIn } from "./auth";
import { buildQuery } from "./format";

export interface NavigateOptions {
  /** 查询参数，自动拼接到路径上。 */
  params?: Record<string, unknown>;
  /** 需要登录态，未登录则先跳登录页并带上回跳地址。 */
  requireAuth?: boolean;
  /** 需要代理商身份，非代理商直接提示（需求 3.6.7：分销板块仅代理商可见）。 */
  requireAgent?: boolean;
  /** 关闭当前页面再跳转。 */
  redirect?: boolean;
}

function isTabBarPath(path: string): boolean {
  return TAB_BAR_PATHS.includes(path);
}

/** 跳转登录页，登录成功后可回到 from 指定的页面。 */
export function toLogin(from?: string): void {
  uni.navigateTo({ url: `${RoutePath.LOGIN}${buildQuery({ from })}` });
}

/**
 * 统一路由跳转，自动处理 TabBar 页、登录态与代理商身份校验。
 *
 * @param path - RoutePath 中定义的页面路径。
 * @param options - 跳转配置。
 */
export function navigate(path: string, options: NavigateOptions = {}): void {
  const { params, requireAuth = false, requireAgent = false, redirect = false } = options;

  if ((requireAuth || requireAgent) && !isLoggedIn()) {
    toLogin(`${path}${buildQuery(params)}`);
    return;
  }

  if (requireAgent && !useUserStore().isAgent) {
    uni.showToast({ title: "该功能仅对代理商开放", icon: "none" });
    return;
  }

  if (isTabBarPath(path)) {
    uni.switchTab({ url: path });
    return;
  }

  const url = `${path}${buildQuery(params)}`;
  if (redirect) {
    uni.redirectTo({ url });
  } else {
    uni.navigateTo({ url });
  }
}

/** 返回上一页，无历史时兜底回首页。 */
export function goBack(delta = 1): void {
  const pages = getCurrentPages();
  if (pages.length > delta) {
    uni.navigateBack({ delta });
  } else {
    uni.switchTab({ url: RoutePath.HOME });
  }
}
