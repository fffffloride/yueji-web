import { request } from "@/utils/request";
import type { PayStatusResult, WxPayParams } from "./types";

const PAY_BASE_URL = "/pay";

const PayAPI = {
  /** 微信支付下单，返回调起支付所需参数。 */
  wxpay(orderId: string) {
    return request<WxPayParams>({
      url: `${PAY_BASE_URL}/wxpay`,
      method: "POST",
      data: { orderId },
      loading: "正在发起支付",
    });
  },

  /** 查询支付状态，用于支付结果页轮询。 */
  getStatus(orderNo: string) {
    return request<PayStatusResult>({
      url: `${PAY_BASE_URL}/status`,
      params: { orderNo },
      skipErrorToast: true,
    });
  },
};

export default PayAPI;
export * from "./types";
