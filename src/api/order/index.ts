import { request } from "@/utils/request";
import type { PageResult } from "../common";
import type {
  AvailableCoupon,
  OrderDetail,
  OrderForm,
  OrderListItem,
  OrderQueryParams,
  OrderQuote,
} from "./types";

const ORDER_BASE_URL = "/app/order";

interface ServerPageResult<T> {
  data: T[];
  page: { total: number };
}

const OrderAPI = {
  quote(data: OrderForm) {
    return request<OrderQuote, OrderForm>({
      url: `${ORDER_BASE_URL}/quote`,
      method: "POST",
      data,
    });
  },

  availableCoupons(data: OrderForm) {
    return request<AvailableCoupon[], OrderForm>({
      url: `${ORDER_BASE_URL}/available-coupons`,
      method: "POST",
      data,
    });
  },

  create(data: OrderForm) {
    return request<OrderDetail, OrderForm>({
      url: ORDER_BASE_URL,
      method: "POST",
      data,
      loading: "提交订单中",
    });
  },

  async getPage(params: OrderQueryParams): Promise<PageResult<OrderListItem>> {
    const result = await request<ServerPageResult<OrderListItem>>({
      url: `${ORDER_BASE_URL}/page`,
      params,
    });
    return { list: result.data ?? [], total: result.page?.total ?? 0 };
  },

  getDetail(id: string) {
    return request<OrderDetail>({ url: `${ORDER_BASE_URL}/${id}` });
  },

  cancel(id: string, reason = "用户取消") {
    return request<OrderDetail, { reason: string }>({
      url: `${ORDER_BASE_URL}/${id}/cancel`,
      method: "POST",
      data: { reason },
    });
  },
};

export default OrderAPI;
export * from "./types";
