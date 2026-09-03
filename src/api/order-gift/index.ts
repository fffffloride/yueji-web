import { request } from "@/utils/request";
import type { PageResult } from "../common";
import type {
  OrderGiftPageQuery,
  OrderGiftPreview,
  OrderGiftRecord,
  OrderGiftShare,
  OrderGiftTokenForm,
} from "./types";

const ORDER_GIFT_BASE_URL = "/app/order-gifts";

const OrderGiftAPI = {
  create(orderId: string) {
    return request<OrderGiftShare, { orderId: string }>({
      url: ORDER_GIFT_BASE_URL,
      method: "POST",
      data: { orderId },
      loading: "正在生成赠礼",
    });
  },

  preview(token: string) {
    return request<OrderGiftPreview, OrderGiftTokenForm>({
      url: `${ORDER_GIFT_BASE_URL}/preview`,
      method: "POST",
      data: { token },
      skipAuth: true,
      skipErrorToast: true,
    });
  },

  claim(token: string) {
    return request<OrderGiftRecord, OrderGiftTokenForm>({
      url: `${ORDER_GIFT_BASE_URL}/claim`,
      method: "POST",
      data: { token },
      loading: "领取中",
    });
  },

  revoke(id: string) {
    return request<OrderGiftRecord>({
      url: `${ORDER_GIFT_BASE_URL}/${id}/revoke`,
      method: "POST",
    });
  },

  returnGift(id: string) {
    return request<OrderGiftRecord>({
      url: `${ORDER_GIFT_BASE_URL}/${id}/return`,
      method: "POST",
    });
  },

  getPage(params: OrderGiftPageQuery) {
    return request<PageResult<OrderGiftRecord>>({ url: ORDER_GIFT_BASE_URL, params });
  },
};

export default OrderGiftAPI;
export * from "./types";
