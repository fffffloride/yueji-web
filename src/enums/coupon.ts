/** 优惠券类型，对应需求 3.7.4。 */
export enum CouponTypeEnum {
  /** 满减券 */
  DISCOUNT_AMOUNT = "DISCOUNT_AMOUNT",
  /** 折扣券 */
  DISCOUNT_RATE = "DISCOUNT_RATE",
  /** 兑换券 */
  EXCHANGE = "EXCHANGE",
}

export const COUPON_TYPE_LABEL: Record<CouponTypeEnum, string> = {
  [CouponTypeEnum.DISCOUNT_AMOUNT]: "满减券",
  [CouponTypeEnum.DISCOUNT_RATE]: "折扣券",
  [CouponTypeEnum.EXCHANGE]: "兑换券",
};

export enum CouponStatusEnum {
  UNUSED = "UNUSED",
  USED = "USED",
  EXPIRED = "EXPIRED",
}

export const COUPON_STATUS_LABEL: Record<CouponStatusEnum, string> = {
  [CouponStatusEnum.UNUSED]: "未使用",
  [CouponStatusEnum.USED]: "已使用",
  [CouponStatusEnum.EXPIRED]: "已过期",
};
