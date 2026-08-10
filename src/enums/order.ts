/** 订单状态，对应需求 3.6.2 订单管理。 */
export enum OrderStatusEnum {
  /** 待付款 */
  UNPAID = "UNPAID",
  /** 已付款 */
  PAID = "PAID",
  /** 待核销 */
  PENDING_VERIFY = "PENDING_VERIFY",
  /** 已核销 */
  VERIFIED = "VERIFIED",
  /** 已完成 */
  COMPLETED = "COMPLETED",
  /** 已转赠 */
  GIFTED = "GIFTED",
  /** 已取消 */
  CANCELLED = "CANCELLED",
}

export const ORDER_STATUS_LABEL: Record<OrderStatusEnum, string> = {
  [OrderStatusEnum.UNPAID]: "待付款",
  [OrderStatusEnum.PAID]: "已付款",
  [OrderStatusEnum.PENDING_VERIFY]: "待核销",
  [OrderStatusEnum.VERIFIED]: "已核销",
  [OrderStatusEnum.COMPLETED]: "已完成",
  [OrderStatusEnum.GIFTED]: "转赠",
  [OrderStatusEnum.CANCELLED]: "已取消",
};

/** 订单列表页顶部的状态筛选项，顺序与需求文档一致。 */
export const ORDER_STATUS_TABS = [
  { value: "", label: "全部" },
  { value: OrderStatusEnum.UNPAID, label: ORDER_STATUS_LABEL.UNPAID },
  { value: OrderStatusEnum.PAID, label: ORDER_STATUS_LABEL.PAID },
  { value: OrderStatusEnum.PENDING_VERIFY, label: ORDER_STATUS_LABEL.PENDING_VERIFY },
  { value: OrderStatusEnum.VERIFIED, label: ORDER_STATUS_LABEL.VERIFIED },
  { value: OrderStatusEnum.COMPLETED, label: ORDER_STATUS_LABEL.COMPLETED },
  { value: OrderStatusEnum.GIFTED, label: ORDER_STATUS_LABEL.GIFTED },
];
