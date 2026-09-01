/**
 * 个人中心静态数据（还原设计稿阶段使用，后续替换为真实接口）。
 * 金额一律为整数分，展示时经 formatPrice 转换。
 */

/** 会员卡统计项。 */
export interface MemberStat {
  label: string;
  count: number;
}

/** 会员卡信息。 */
export interface MemberInfo {
  /** 会员等级文案，如「悦己DLumière MEMBER」 */
  levelName: string;
  /** 等级进度 0-100 */
  progress: number;
  /** 待解锁进度文案，如「0/1」 */
  lockedText: string;
  stats: MemberStat[];
}

/** 快捷工具条目（YjQuickEntry 数据源）。 */
export interface QuickTool {
  label: string;
  /** 数值，如积分数量；有值时优先展示数值 */
  value?: string;
  /** wd-icon 图标名 */
  icon?: string;
}

/** 服务入口。 */
export interface ServiceEntry {
  label: string;
}

/** 社群二维码卡。 */
export interface CommunityInfo {
  title: string;
  sub: string;
}

/** 会员卡静态数据。 */
export const mineMember: MemberInfo = {
  levelName: "悦己DLumière MEMBER",
  progress: 30,
  lockedText: "0/1",
  stats: [
    { label: "待预约", count: 0 },
    { label: "待到店", count: 0 },
    { label: "服务记录", count: 0 },
  ],
};

/** 快捷工具（全部订单 / 优惠券 / 钱包 / 积分）。 */
export const mineQuickTools: QuickTool[] = [
  { label: "全部订单", icon: "list" },
  { label: "优惠券", icon: "creditcard" },
  { label: "钱包", icon: "wallet" },
  { label: "积分", icon: "star" },
];

/** 服务入口列表。 */
export const mineServices: ServiceEntry[] = [
  { label: "病历签署" },
  { label: "悦己圈" },
  { label: "核销有礼" },
  { label: "关于我们" },
  { label: "设置" },
];

/** 社群二维码卡。 */
export const mineCommunity: CommunityInfo = {
  title: "长按加入悦己同好社群",
  sub: "领50元券｜城市限定好价｜同城变美搭子",
};
