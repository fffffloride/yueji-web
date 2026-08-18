import type { MemberLevelEnum } from "@/enums";

/** 微信登录入参。 */
export interface LoginRequest {
  /** uni.login 返回的临时凭证 */
  code: string;
  /** 分享/分销场景带入的推荐人 ID */
  inviterId?: string;
}

export interface LoginResult {
  tokenType: string;
  accessToken: string;
  refreshToken: string;
  /** token 有效期（秒） */
  expiresIn: number;
  hasMobile: boolean;
}

/** 服务端会员资料。 */
export interface MemberProfile {
  id: string;
  nickname: string;
  avatar?: string | null;
  mobile?: string | null;
  gender: 0 | 1 | 2;
  points: number;
  totalSpent: number;
  levelId?: string | null;
}

/** 登录用户信息。 */
export interface UserInfo {
  id: string;
  nickname: string;
  avatar: string;
  phone: string;
  realName?: string;
  memberLevel?: MemberLevelEnum;
  /** 累计消费金额（分） */
  totalConsumption: number;
  points: number;
  /** 是否为代理商，决定分销板块是否可见 */
  isAgent?: boolean;
}

/** 个人资料表单。 */
export interface UserForm {
  nickname: string;
  avatar: string;
  realName?: string;
  gender?: 0 | 1 | 2;
  birthday?: string;
}

/** 钱包信息，对应需求 3.6.3。 */
export interface UserWallet {
  /** 余额（分） */
  balance: number;
  /** 累计充值（分） */
  totalRecharge: number;
  /** 累计消费返现（分） */
  totalCashback: number;
}

/** 积分信息，对应需求 3.6.4。 */
export interface UserPoints {
  balance: number;
  /** 积分抵现比例说明，如 "100积分抵扣1元" */
  exchangeRule: string;
}
