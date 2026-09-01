/** 优惠券类型，与服务端 CouponType 保持一致。 */
export enum CouponTypeEnum {
  /** 满减券 */
  FULL_REDUCTION = "FULL_REDUCTION",
  /** 折扣券 */
  DISCOUNT = "DISCOUNT",
  /** 兑换券 */
  EXCHANGE = "EXCHANGE",
}

export const COUPON_TYPE_LABEL: Record<CouponTypeEnum, string> = {
  [CouponTypeEnum.FULL_REDUCTION]: "满减券",
  [CouponTypeEnum.DISCOUNT]: "折扣券",
  [CouponTypeEnum.EXCHANGE]: "兑换券",
};

export enum CouponScopeTypeEnum {
  ALL = "ALL",
  CATEGORY = "CATEGORY",
  PRODUCT = "PRODUCT",
}

export const COUPON_SCOPE_LABEL: Record<CouponScopeTypeEnum, string> = {
  [CouponScopeTypeEnum.ALL]: "全场项目通用",
  [CouponScopeTypeEnum.CATEGORY]: "指定分类项目可用",
  [CouponScopeTypeEnum.PRODUCT]: "指定项目可用",
};

/** 会员券状态，与服务端 MemberCouponStatus 保持一致。 */
export enum CouponStatusEnum {
  UNUSED = 0,
  LOCKED = 1,
  USED = 2,
  EXPIRED = 3,
}

export const COUPON_STATUS_LABEL: Record<CouponStatusEnum, string> = {
  [CouponStatusEnum.UNUSED]: "未使用",
  [CouponStatusEnum.LOCKED]: "已锁定",
  [CouponStatusEnum.USED]: "已使用",
  [CouponStatusEnum.EXPIRED]: "已过期",
};
