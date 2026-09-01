import type { CouponScopeTypeEnum, CouponStatusEnum, CouponTypeEnum } from "@/enums/coupon";
import type { BaseQueryParams } from "../common";

export interface ClaimableCoupon {
  id: string;
  name: string;
  type: CouponTypeEnum;
  scopeType: CouponScopeTypeEnum;
  thresholdAmount: number;
  discountAmount: number;
  discountRate: number;
  maxDiscountAmount?: number | null;
  claimStart: string;
  claimEnd: string;
  validStart: string;
  validEnd: string;
  totalQuantity: number;
  issuedQuantity: number;
  perMemberLimit: number;
  receivedCount: number;
  canClaim: boolean;
}

export interface CouponClaimResult {
  id: string;
  couponId: string;
  memberId: string;
  status: CouponStatusEnum;
  claimedAt: string;
}

export interface MemberCouponItem {
  id: string;
  couponId: string;
  status: CouponStatusEnum;
  orderId?: string | null;
  claimedAt: string;
  usedAt?: string | null;
  couponName: string;
  couponType?: CouponTypeEnum | null;
  scopeType?: CouponScopeTypeEnum | null;
  thresholdAmount: number;
  discountAmount: number;
  discountRate: number;
  maxDiscountAmount?: number | null;
  validStart?: string | null;
  validEnd?: string | null;
}

export type CouponQueryParams = BaseQueryParams;

export interface MemberCouponQueryParams extends BaseQueryParams {
  status?: CouponStatusEnum;
}

export enum PointsBizType {
  INIT = "INIT",
  ORDER_DEDUCT = "ORDER_DEDUCT",
  ORDER_CANCEL_RETURN = "ORDER_CANCEL_RETURN",
  ORDER_REFUND_RETURN = "ORDER_REFUND_RETURN",
  ORDER_EARN = "ORDER_EARN",
}

export interface PointsRule {
  earnPerYuan: number;
  redeemPointsPerYuan: number;
  maxDeductRate: number;
}

export interface PointsAccount {
  points: number;
  totalSpent: number;
  level: {
    id: string;
    name: string;
    discountRate: number;
  } | null;
  rule: PointsRule;
}

export interface PointsLogItem {
  id: string;
  memberId: string;
  changePoints: number;
  balanceAfter: number;
  bizType: PointsBizType;
  bizId: string;
  orderId?: string | null;
  remark?: string | null;
  createTime: string;
}

export interface PointsQueryParams extends BaseQueryParams {
  bizType?: PointsBizType;
}
