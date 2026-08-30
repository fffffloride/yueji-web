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
  /** 挑战赛标题，如「L3会员挑战赛」 */
  challengeTitle: string;
  /** 赠送项目价值（分） */
  challengeGift: number;
  /** 挑战赛按钮文案 */
  challengeButtonText: string;
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

/** 邀请有礼奖励统计。 */
export interface InviteStat {
  label: string;
  value: number;
  /** 金额（分）还是普通数值 */
  isMoney?: boolean;
}

/** 邀请有礼区块。 */
export interface InviteInfo {
  title: string;
  detailText: string;
  bannerText: string;
  participantsText: string;
  stats: InviteStat[];
  buttonText: string;
}

/** 服务入口。 */
export interface ServiceEntry {
  label: string;
  /** wd-icon 图标名 */
  icon: string;
}

/** 社群二维码卡。 */
export interface CommunityInfo {
  title: string;
  sub: string;
}

/** 专属服务群。 */
export interface ServiceGroup {
  title: string;
  desc: string;
  sub: string;
  joinText: string;
  benefits: string[];
}

/** 会员卡静态数据。 */
export const mineMember: MemberInfo = {
  levelName: "悦己DLumière MEMBER",
  progress: 30,
  lockedText: "0/1",
  challengeTitle: "L3会员挑战赛",
  challengeGift: 69900,
  challengeButtonText: "去报名",
  stats: [
    { label: "待预约", count: 0 },
    { label: "待到店", count: 0 },
    { label: "服务记录", count: 0 },
  ],
};

/** 快捷工具（全部订单 / 礼品卡 / 钱包 / 积分）。 */
export const mineQuickTools: QuickTool[] = [
  { label: "全部订单", icon: "list" },
  { label: "礼品卡", icon: "creditcard" },
  { label: "钱包", icon: "wallet" },
  { label: "积分", value: "0" },
];

/** 邀请有礼。 */
export const mineInvite: InviteInfo = {
  title: "邀请有礼",
  detailText: "了解详情",
  bannerText: "送您 3000 元现金！",
  participantsText: "7.8万人参与",
  stats: [
    { label: "无门槛优惠券", value: 0, isMoney: true },
    { label: "现金奖励", value: 0, isMoney: true },
    { label: "积分奖励", value: 0 },
  ],
  buttonText: "立即邀请",
};

/** 服务入口宫格。 */
export const mineServices: ServiceEntry[] = [
  { label: "病历签署", icon: "file" },
  { label: "悦己圈", icon: "info-circle" },
  { label: "核销有礼", icon: "gift" },
  { label: "关于我们", icon: "help-circle" },
  { label: "设置", icon: "setting" },
];

/** 社群二维码卡。 */
export const mineCommunity: CommunityInfo = {
  title: "长按加入悦己同好社群",
  sub: "领50元券｜城市限定好价｜同城变美搭子",
};

/** 专属服务群。 */
export const mineServiceGroup: ServiceGroup = {
  title: "悦己专属服务群",
  desc: "加入您的专属服务群",
  sub: "每周三抢大额神券，多重惊喜",
  joinText: "立即进群",
  benefits: ["真实案例对比", "7x24小时智能服务", "术后护理指南", "生日礼·核销礼·专属优惠券"],
};
