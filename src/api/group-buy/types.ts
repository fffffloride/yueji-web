export enum GroupBuyStatusEnum {
  FORMING = 0,
  SUCCESS = 1,
  FAILED = 2,
}

export enum GroupBuyMemberStatusEnum {
  PENDING = 0,
  PAID = 1,
  REFUNDED = 2,
  CANCELLED = 3,
}

export interface GroupBuyGroup {
  id: string;
  activityId: string;
  leaderMemberId: string;
  requiredPeople: number;
  groupPrice: number;
  expireTime: string;
  status: GroupBuyStatusEnum;
  successTime?: string | null;
  failTime?: string | null;
  createTime: string;
  paidPeople: number;
  occupiedPeople: number;
}

export interface GroupBuyActivity {
  id: string;
  skuId: string;
  name: string;
  groupPrice: number;
  requiredPeople: number;
  startTime: string;
  endTime: string;
  groupDurationMinutes: number;
  status: number;
  skuName: string;
  skuPrice: number;
  productId?: string | null;
  productName: string;
  productImage?: string | null;
  groups: GroupBuyGroup[];
}

export interface GroupBuyMember {
  id: string;
  memberId: string;
  orderId: string;
  status: GroupBuyMemberStatusEnum;
  paidTime?: string | null;
  nickname: string;
  avatar?: string | null;
}

export interface GroupBuyGroupDetail extends GroupBuyGroup {
  activityName: string;
  members: GroupBuyMember[];
}

export interface GroupBuyOrderResult {
  groupId: string;
  orderId: string;
  orderNo: string;
  groupPrice: number;
  expireTime: string;
}
