import { request } from "@/utils/request";
import type { PageResult } from "../common";
import type {
  ClaimableCoupon,
  CouponClaimResult,
  CouponQueryParams,
  MemberCouponItem,
  MemberCouponQueryParams,
  PointsAccount,
  PointsLogItem,
  PointsQueryParams,
} from "./types";

const MARKETING_BASE_URL = "/app/marketing";

const MarketingAPI = {
  getPointsAccount() {
    return request<PointsAccount>({
      url: `${MARKETING_BASE_URL}/account`,
    });
  },

  getPointsPage(params: PointsQueryParams) {
    return request<PageResult<PointsLogItem>>({
      url: `${MARKETING_BASE_URL}/points/page`,
      params,
    });
  },

  getClaimable(params: CouponQueryParams) {
    return request<PageResult<ClaimableCoupon>>({
      url: `${MARKETING_BASE_URL}/coupons/claimable`,
      params,
    });
  },

  claim(couponId: string) {
    return request<CouponClaimResult>({
      url: `${MARKETING_BASE_URL}/coupons/${couponId}/claim`,
      method: "POST",
      loading: "领取中",
    });
  },

  getMyCoupons(params: MemberCouponQueryParams) {
    return request<PageResult<MemberCouponItem>>({
      url: `${MARKETING_BASE_URL}/coupons/mine`,
      params,
    });
  },
};

export default MarketingAPI;
export * from "./types";
