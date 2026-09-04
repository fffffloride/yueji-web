import { formatPrice } from "./format";

export const COMMISSION_LABELS: Record<number, string> = {
  0: "待核销",
  1: "待结算",
  2: "已冲销",
  3: "已结算",
};
export const WITHDRAWAL_LABELS: Record<number, string> = {
  0: "待审核",
  1: "待打款",
  2: "已驳回",
  3: "已打款",
};
export const AGENT_LABELS: Record<number, string> = {
  0: "待审核",
  1: "已启用",
  2: "已驳回",
  3: "已停用",
};
export const TASK_LABELS: Record<string, string> = {
  NOT_STARTED: "未开始",
  IN_PROGRESS: "进行中",
  FINISHED: "已结束",
  CANCELLED: "已取消",
};
export const CYCLE_LABELS = { WEEK: "每周", MONTH: "每月", QUARTER: "每季度", YEAR: "每年" };

export function taskValue(value: number, metric: string) {
  return metric === "SALES_AMOUNT" ? `${formatPrice(value)} 元` : `${value} 单`;
}

export function hasDistributionAccess(status?: number): boolean {
  return status === 1 || status === 3;
}

/** 只接受十进制元金额，以字符串拆分避免浮点乘法误差。 */
export function withdrawalCents(value: string, available: number, limit: number): number {
  const normalized = value.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) throw new Error("请输入最多两位小数的提现金额");
  const [yuan, fraction = ""] = normalized.split(".");
  const cents = Number(yuan) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents) || cents <= 0) throw new Error("提现金额必须大于 0 元");
  if (cents > available) throw new Error("提现金额超过可提现余额");
  if (cents > limit) throw new Error("提现金额超过单笔上限");
  return cents;
}

export function dateRangeError(start: string, end: string): string {
  if (Boolean(start) !== Boolean(end)) return "请选择完整的开始和结束日期";
  if (!start) return "";
  const validDate = (value: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value;
  if (!validDate(start) || !validDate(end)) return "请选择有效日期";
  if (start > end) return "开始日期不能晚于结束日期";
  if ((Date.parse(end) - Date.parse(start)) / 86_400_000 + 1 > 1827)
    return "查询时间跨度不能超过 5 年";
  return "";
}

export function monthRange(previous = false, now = new Date()) {
  const date = (value: Date) =>
    `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
  return {
    startDate: date(new Date(now.getFullYear(), now.getMonth() - Number(previous), 1)),
    endDate: date(previous ? new Date(now.getFullYear(), now.getMonth(), 0) : now),
  };
}
