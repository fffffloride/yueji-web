import { request } from "@/utils/request";
import type { PageResult } from "../common";
import type {
  OrderCreateResult,
  OrderDetail,
  OrderForm,
  OrderItem,
  OrderQueryParams,
} from "./types";

const ORDER_BASE_URL = "/order";

const OrderAPI = {
  /** 创建订单。 */
  create(data: OrderForm) {
    return request<OrderCreateResult, OrderForm>({
      url: `${ORDER_BASE_URL}/create`,
      method: "POST",
      data,
      loading: "提交中",
    });
  },

  /** 获取订单分页列表。 */
  getPage(params: OrderQueryParams) {
    return request<PageResult<OrderItem>>({ url: `${ORDER_BASE_URL}/list`, params });
  },

  /** 获取订单详情。 */
  getDetail(id: string) {
    return request<OrderDetail>({ url: `${ORDER_BASE_URL}/${id}` });
  },

  /** 取消订单。 */
  cancel(id: string) {
    return request<void>({ url: `${ORDER_BASE_URL}/cancel`, method: "POST", data: { id } });
  },

  /** 申请退款，未核销的订单可退。 */
  refund(id: string, reason: string) {
    return request<void>({
      url: `${ORDER_BASE_URL}/refund`,
      method: "POST",
      data: { id, reason },
    });
  },
};

export default OrderAPI;
export * from "./types";
