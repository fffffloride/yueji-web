import type { PointsAccount } from "@/api/marketing";

/** 当前等级到下一等级的展示进度；最高等级固定为 100%。 */
export function memberLevelProgress(account?: PointsAccount | null): number {
  if (!account?.level) return 0;
  if (!account.nextLevel) return 100;

  const range = account.nextLevel.thresholdAmount - account.level.thresholdAmount;
  if (range <= 0) return 0;
  const progress = ((account.totalSpent - account.level.thresholdAmount) / range) * 100;
  return Math.min(100, Math.max(0, progress));
}
