import type { PointsAccount } from "@/api/marketing";

export type MemberTierTone = "guest" | "l1" | "l2" | "l3" | "l4" | "custom";

/** 根据后台等级编号选择会员卡配色，未知等级统一使用紫晶兜底。 */
export function memberTierTone(code?: string | null): MemberTierTone {
  const normalized = code?.trim().toUpperCase();
  if (!normalized) return "guest";
  if (["L1", "L2", "L3", "L4"].includes(normalized)) {
    return normalized.toLowerCase() as MemberTierTone;
  }
  return "custom";
}

/** 当前等级到下一等级的展示进度；最高等级固定为 100%。 */
export function memberLevelProgress(account?: PointsAccount | null): number {
  if (!account?.level) return 0;
  if (!account.nextLevel) return 100;

  const range = account.nextLevel.thresholdAmount - account.level.thresholdAmount;
  if (range <= 0) return 0;
  const progress = ((account.totalSpent - account.level.thresholdAmount) / range) * 100;
  return Math.min(100, Math.max(0, progress));
}
