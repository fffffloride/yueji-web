import type { OrderStatusEnum } from "@/enums";
import type { BaseQueryParams } from "../common";

/** 下单商品项。 */
export interface OrderItemForm {
  productId: string;
  skuId: string;
  quantity: number;
}

/** 创建订单入参，对应需求 3.5.1 订单确认。 */
export interface OrderForm {
  items: OrderItemForm[];
  /** 联系人姓名 */
  contactName: string;
  contactPhone: string;
  /** 到店时间 */
  arrivalTime?: string;
  couponId?: string;
  /** 使用的积分数量 */
  usedPoints?: number;
  remark?: string;
}

export interface OrderCreateResult {
  orderId: string;
  orderNo: string;
  /** 应付金额（分） */
  payAmount: number;
}

/** 订单中的商品快照。 */
export interface OrderProduct {
  productId: string;
  skuId: string;
  name: string;
  skuName: string;
  cover: string;
  price: number;
  quantity: number;
}

/** 订单列表项。 */
export interface OrderItem {
  id: string;
  orderNo: string;
  status: OrderStatusEnum;
  /** 实付金额（分） */
  payAmount: number;
  createdAt: string;
  products: OrderProduct[];
}

/** 订单详情。 */
export interface OrderDetail extends OrderItem {
  contactName: string;
  contactPhone: string;
  arrivalTime?: string;
  remark?: string;
  /** 商品总额（分） */
  totalAmount: number;
  /** 优惠金额（分） */
  discountAmount: number;
  /** 积分抵扣金额（分） */
  pointsAmount: number;
  paidAt?: string;
  /** 核销时间 */
  verifiedAt?: string;
  /** 核销人 */
  verifiedBy?: string;
}

export interface OrderQueryParams extends BaseQueryParams {
  status?: OrderStatusEnum | "";
}
