/** 订单状态，与服务端 OrderStatus 数值保持一致。 */
export enum OrderStatusEnum {
  /** 待付款 */
  UNPAID = 0,
  /** 已付款待核销，服务端当前合并为同一状态。 */
  PAID = 1,
  /** 已核销 */
  VERIFIED = 2,
  /** 已完成 */
  COMPLETED = 3,
  /** 已取消 */
  CANCELLED = 4,
  /** 已退款 */
  REFUNDED = 5,
}

export const ORDER_STATUS_LABEL: Record<OrderStatusEnum, string> = {
  [OrderStatusEnum.UNPAID]: "待付款",
  [OrderStatusEnum.PAID]: "待核销",
  [OrderStatusEnum.VERIFIED]: "已核销",
  [OrderStatusEnum.COMPLETED]: "已完成",
  [OrderStatusEnum.CANCELLED]: "已取消",
  [OrderStatusEnum.REFUNDED]: "已退款",
};

/** 订单列表页顶部的核心状态筛选项。已核销为内部过渡状态，不单独展示。 */
export const ORDER_STATUS_TABS: { label: string; value?: OrderStatusEnum }[] = [
  { label: "全部" },
  { value: OrderStatusEnum.UNPAID, label: ORDER_STATUS_LABEL[OrderStatusEnum.UNPAID] },
  { value: OrderStatusEnum.PAID, label: ORDER_STATUS_LABEL[OrderStatusEnum.PAID] },
  { value: OrderStatusEnum.COMPLETED, label: ORDER_STATUS_LABEL[OrderStatusEnum.COMPLETED] },
];
