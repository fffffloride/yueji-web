import { request } from "@/utils/request";
import type { PageResult } from "../common";
import type {
  AnalyticsQuery,
  CommissionItem,
  DistributionAnalytics,
  DistributionProfile,
  DistributionQuery,
  DistributionTask,
  DistributionTeam,
  SettlementAccount,
  TaskQuery,
  WithdrawalItem,
} from "./types";

const BASE = "/app/distribution";
const DistributionAPI = {
  getProfile: () => request<DistributionProfile>({ url: `${BASE}/profile`, skipErrorToast: true }),
  getAccount: () =>
    request<SettlementAccount>({ url: `${BASE}/settlement/account`, skipErrorToast: true }),
  getCommissions: (params: DistributionQuery) =>
    request<PageResult<CommissionItem>>({
      url: `${BASE}/commissions/page`,
      params,
      skipErrorToast: true,
    }),
  getWithdrawals: (params: DistributionQuery) =>
    request<PageResult<WithdrawalItem>>({
      url: `${BASE}/withdrawals/page`,
      params,
      skipErrorToast: true,
    }),
  withdraw: (amount: number) =>
    request<WithdrawalItem>({
      url: `${BASE}/withdrawals`,
      method: "POST",
      data: { amount },
      skipErrorToast: true,
    }),
  getTeam: () => request<DistributionTeam>({ url: `${BASE}/team`, skipErrorToast: true }),
  getAnalytics: (params: AnalyticsQuery = {}) =>
    request<DistributionAnalytics>({
      url: `${BASE}/analytics/overview`,
      params,
      skipErrorToast: true,
    }),
  getTasks: (params: TaskQuery) =>
    request<PageResult<DistributionTask>>({
      url: `${BASE}/tasks/page`,
      params,
      skipErrorToast: true,
    }),
  getTask: (id: string) =>
    request<DistributionTask>({
      url: `${BASE}/tasks/${encodeURIComponent(id)}`,
      skipErrorToast: true,
    }),
};

export default DistributionAPI;
export * from "./types";
