import type { BaseQueryParams } from "../common";

export interface DistributionAgent {
  id: string;
  memberId: string;
  realName: string;
  mobile: string | null;
  wechat: string | null;
  contactRemark: string | null;
  typeName: string | null;
  levelName: string | null;
  status: number;
  inviteCode: string;
  directVerifiedSales: number;
}

export interface DistributionProfile {
  agent: DistributionAgent | null;
  commissionSummary: {
    waitingVerify: number;
    pendingSettlement: number;
    settled: number;
    reversed: number;
  };
}

export interface SettlementAccount {
  agentId: string;
  agentStatus: number;
  cycleType: "WEEK" | "MONTH" | "QUARTER" | "YEAR";
  settlementDay: number;
  withdrawalMode: "APPLY" | "AUTO";
  singleLimitAmount: number;
  nextSettlementDate: string;
  waitingVerifyAmount: number;
  pendingSettlementAmount: number;
  settledTotal: number;
  frozenAmount: number;
  paidAmount: number;
  availableAmount: number;
}

export interface DistributionQuery extends BaseQueryParams {
  status?: number;
  depth?: number;
  startTime?: string;
  endTime?: string;
}

export interface CommissionItem {
  id: string;
  orderNo: string;
  depth: number;
  baseAmount: number;
  rateBps: number;
  commissionAmount: number;
  status: number;
  paidTime: string;
  pendingSettlementTime: string | null;
  settledTime: string | null;
  reversedTime: string | null;
}

export interface WithdrawalItem {
  id: string;
  withdrawalNo: string;
  sourceMode: "APPLY" | "AUTO";
  amount: number;
  status: number;
  reviewTime: string | null;
  reviewReason: string | null;
  transferNo: string | null;
  paidTime: string | null;
  paidRemark: string | null;
  createTime: string;
}

export interface DistributionTeam {
  directCount: number;
  agents: { id: string; realName: string; status: number; directVerifiedSales: number }[];
}

export interface AnalyticsQuery {
  startDate?: string;
  endDate?: string;
}

export interface DistributionAnalytics {
  startDate: string;
  endDate: string;
  granularity: "DAY" | "MONTH" | "YEAR";
  summary: { salesAmount: number; orderCount: number; customerCount: number };
  trend: { period: string; salesAmount: number }[];
}

export type TaskStatus = "NOT_STARTED" | "IN_PROGRESS" | "FINISHED" | "CANCELLED";
export interface TaskQuery extends BaseQueryParams {
  displayStatus?: TaskStatus;
}
export interface DistributionTask {
  id: string;
  name: string;
  description: string | null;
  metricType: "SALES_AMOUNT" | "ORDER_COUNT";
  targetValue: number;
  startTime: string;
  endTime: string;
  displayStatus: TaskStatus;
  currentValue: number;
  completed: boolean;
  progressRateBps: number;
}
