import { RoutePath } from "@/constants";
import { findMock } from "@/mocks";
import { appSettings } from "@/settings";
import { clearAccessToken, getAccessToken } from "./auth";
import { buildQuery } from "./format";

/** 后端统一返回结构：youlai-nest 风格，成功码 "00000"，消息字段为 msg。 */
export interface ApiResult<T = unknown> {
  code: string;
  msg: string;
  data: T;
}

export type RequestMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface RequestOptions<D = unknown> {
  /** 接口路径，不含 baseURL 与版本前缀，如 "/user/info"。 */
  url: string;
  method?: RequestMethod;
  /** 请求体。 */
  data?: D;
  /** 查询参数，会拼接到 url 上。 */
  params?: object;
  header?: Record<string, string>;
  /** 跳过 token 注入，用于登录等无需鉴权的接口。 */
  skipAuth?: boolean;
  /** 跳过统一错误 toast，由调用方自行处理异常。 */
  skipErrorToast?: boolean;
  /** 展示全屏 loading，传字符串可自定义文案。 */
  loading?: boolean | string;
}

const BUSINESS_CODE_SUCCESS = "00000";

const baseURL = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_PREFIX}`;
const isMockEnabled = import.meta.env.VITE_USE_MOCK === "true";

/** 并发请求同时返回 401 时，只跳转一次登录页。 */
let isRedirectingToLogin = false;

function showErrorToast(message: string): void {
  uni.showToast({ title: message, icon: "none", duration: 2000 });
}

function handleUnauthorized(): void {
  clearAccessToken();
  if (isRedirectingToLogin) return;

  isRedirectingToLogin = true;
  uni.navigateTo({
    url: RoutePath.LOGIN,
    complete: () => {
      isRedirectingToLogin = false;
    },
  });
}

/**
 * 统一请求方法，成功时直接返回业务数据，失败时抛出 Error。
 *
 * @param options - 请求配置。
 * @returns 后端 data 字段的内容。
 */
export async function request<T = unknown, D = unknown>(
  options: RequestOptions<D>
): Promise<T> {
  const {
    url,
    method = "GET",
    data,
    params,
    header,
    skipAuth = false,
    skipErrorToast = false,
    loading = false,
  } = options;

  if (isMockEnabled) {
    const handler = findMock(method, url);
    if (handler) {
      return (await handler({ data, params })) as T;
    }
  }

  if (loading) {
    uni.showLoading({ title: typeof loading === "string" ? loading : "加载中", mask: true });
  }

  const requestHeader: Record<string, string> = {
    "Content-Type": "application/json",
    ...header,
  };
  if (!skipAuth) {
    const token = getAccessToken();
    if (token) requestHeader.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await uni.request({
      url: `${baseURL}${url}${buildQuery(params)}`,
      method,
      data: data as string | AnyObject | ArrayBuffer,
      header: requestHeader,
      timeout: appSettings.requestTimeout,
    });

    // 后端对未登录/token失效返回 HTTP 401
    if (response.statusCode === 401) {
      handleUnauthorized();
      throw new Error("登录已失效，请重新登录");
    }

    const result = response.data as ApiResult<T>;
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw new Error(result?.msg || `网络异常（${response.statusCode}）`);
    }

    if (result.code !== BUSINESS_CODE_SUCCESS) {
      throw new Error(result.msg || "请求失败");
    }

    return result.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "网络异常，请稍后重试";
    if (!skipErrorToast) showErrorToast(message);
    throw error instanceof Error ? error : new Error(message);
  } finally {
    if (loading) uni.hideLoading();
  }
}

export default request;
