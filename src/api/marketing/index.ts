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

interface ServerPageResult<T> {
  data: T[];
  page: { total: number };
}

async function toPageResult<T>(promise: Promise<ServerPageResult<T>>): Promise<PageResult<T>> {
  const result = await promise;
  return { list: result.data ?? [], total: result.page?.total ?? 0 };
}

const MarketingAPI = {
  getPointsAccount() {
    return request<PointsAccount>({
      url: `${MARKETING_BASE_URL}/account`,
    });
  },

  getPointsPage(params: PointsQueryParams) {
    return toPageResult(
      request<ServerPageResult<PointsLogItem>>({
        url: `${MARKETING_BASE_URL}/points/page`,
        params,
      })
    );
  },

  getClaimable(params: CouponQueryParams) {
    return toPageResult(
      request<ServerPageResult<ClaimableCoupon>>({
        url: `${MARKETING_BASE_URL}/coupons/claimable`,
        params,
      })
    );
  },

  claim(couponId: string) {
    return request<CouponClaimResult>({
      url: `${MARKETING_BASE_URL}/coupons/${couponId}/claim`,
      method: "POST",
      loading: "领取中",
    });
  },

  getMyCoupons(params: MemberCouponQueryParams) {
    return toPageResult(
      request<ServerPageResult<MemberCouponItem>>({
        url: `${MARKETING_BASE_URL}/coupons/mine`,
        params,
      })
    );
  },
};

export default MarketingAPI;
export * from "./types";
