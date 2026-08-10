/** 消费会员等级，对应需求 3.6.5 会员中心。 */
export enum MemberLevelEnum {
  NORMAL = "NORMAL",
  SILVER = "SILVER",
  GOLD = "GOLD",
  PLATINUM = "PLATINUM",
}

interface MemberLevelConfig {
  label: string;
  /** 该等级的累计消费下限（分） */
  minAmount: number;
  /** 该等级的累计消费上限（分），Infinity 表示无上限 */
  maxAmount: number;
  /** 折扣率，1 表示不打折 */
  discount: number;
}

/** 前端仅用于展示兜底，实际等级与折扣以后台配置为准。 */
export const MEMBER_LEVEL_CONFIG: Record<MemberLevelEnum, MemberLevelConfig> = {
  [MemberLevelEnum.NORMAL]: {
    label: "普通会员",
    minAmount: 0,
    maxAmount: 5_000_000,
    discount: 1,
  },
  [MemberLevelEnum.SILVER]: {
    label: "白银会员",
    minAmount: 5_000_000,
    maxAmount: 10_000_000,
    discount: 0.9,
  },
  [MemberLevelEnum.GOLD]: {
    label: "黄金会员",
    minAmount: 10_000_000,
    maxAmount: 20_000_000,
    discount: 0.8,
  },
  [MemberLevelEnum.PLATINUM]: {
    label: "白金会员",
    minAmount: 20_000_000,
    maxAmount: 50_000_000,
    discount: 0.7,
  },
};
