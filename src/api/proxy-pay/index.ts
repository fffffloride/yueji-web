import { getAccessToken } from "@/utils/auth";
import { request } from "@/utils/request";
import type {
  ProxyPayPayment,
  ProxyPayPreview,
  ProxyPayShare,
  ProxyPayStatusInfo,
  ProxyPayTokenForm,
} from "./types";

const PROXY_PAY_BASE_URL = "/app/proxy-pay";
const apiBaseUrl = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_PREFIX}`;

const ProxyPayAPI = {
  createShare(orderId: string) {
    return request<ProxyPayShare, { orderId: string }>({
      url: `${PROXY_PAY_BASE_URL}/share`,
      method: "POST",
      data: { orderId },
      loading: "正在生成代付邀请",
    });
  },

  preview(token: string) {
    return request<ProxyPayPreview, ProxyPayTokenForm>({
      url: `${PROXY_PAY_BASE_URL}/preview`,
      method: "POST",
      data: { token },
      skipAuth: true,
      skipErrorToast: true,
    });
  },

  createPayment(token: string) {
    return request<ProxyPayPayment, ProxyPayTokenForm>({
      url: `${PROXY_PAY_BASE_URL}/payment`,
      method: "POST",
      data: { token },
      loading: "正在发起支付",
    });
  },

  getStatus(token: string) {
    return request<ProxyPayStatusInfo, ProxyPayTokenForm>({
      url: `${PROXY_PAY_BASE_URL}/status`,
      method: "POST",
      data: { token },
      skipAuth: true,
      skipErrorToast: true,
    });
  },

  /** 海报二维码是 PNG 原始响应，不能经过统一 JSON 解包。 */
  async getPosterCode(token: string): Promise<ArrayBuffer> {
    const accessToken = getAccessToken();
    const response = await uni.request({
      url: `${apiBaseUrl}${PROXY_PAY_BASE_URL}/poster-code`,
      method: "POST",
      data: { token },
      header: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      responseType: "arraybuffer",
    });
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw new Error("小程序码生成失败，请稍后重试");
    }
    if (!(response.data instanceof ArrayBuffer)) throw new Error("小程序码响应格式错误");
    return response.data;
  },
};

export default ProxyPayAPI;
export * from "./types";
