import { request } from "@/utils/request";
import type { PaymentInfo } from "./types";

const PAYMENT_BASE_URL = "/app/payment";

const PayAPI = {
  create(orderId: string) {
    return request<PaymentInfo, { orderId: string }>({
      url: PAYMENT_BASE_URL,
      method: "POST",
      data: { orderId },
      loading: "创建支付单中",
    });
  },

  get(paymentNo: string) {
    return request<PaymentInfo>({
      url: `${PAYMENT_BASE_URL}/${paymentNo}`,
      skipErrorToast: true,
    });
  },

  confirmMock(paymentNo: string) {
    return request<PaymentInfo>({
      url: `${PAYMENT_BASE_URL}/${paymentNo}/mock-confirm`,
      method: "POST",
      loading: "支付确认中",
    });
  },
};

export default PayAPI;
export * from "./types";
