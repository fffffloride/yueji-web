import type { BaseQueryParams } from "../common";

export const OrderGiftStatus = {
  PENDING: 0,
  CLAIMED: 1,
  REVOKED: 2,
  EXPIRED: 3,
  RETURNED: 4,
} as const;

export type OrderGiftStatus = (typeof OrderGiftStatus)[keyof typeof OrderGiftStatus];
export type OrderGiftDirection = "SENT" | "RECEIVED";

export interface OrderGiftItem {
  id: string;
  productId: string;
  skuId: string;
  productName: string;
  productImage?: string | null;
  skuName?: string | null;
  quantity: number;
}

export interface OrderGiftShare {
  id: string;
  orderId: string;
  status: OrderGiftStatus;
  statusLabel: string;
  token: string;
  expiresAt: string;
  items: OrderGiftItem[];
  canRevoke: boolean;
}

export interface OrderGiftPreview {
  id: string;
  status: OrderGiftStatus;
  statusLabel: string;
  senderNickname?: string | null;
  senderAvatar?: string | null;
  expiresAt: string;
  items: OrderGiftItem[];
  canClaim: boolean;
}

export interface OrderGiftRecord {
  id: string;
  orderId: string;
  status: OrderGiftStatus;
  statusLabel: string;
  direction: OrderGiftDirection;
  senderNickname?: string | null;
  senderAvatar?: string | null;
  recipientNickname?: string | null;
  recipientAvatar?: string | null;
  expiresAt: string;
  claimedAt?: string | null;
  revokedAt?: string | null;
  returnedAt?: string | null;
  items: OrderGiftItem[];
  canRevoke: boolean;
  canReturnGift: boolean;
  canBookAppointment: boolean;
}

export interface OrderGiftPageQuery extends BaseQueryParams {
  direction: OrderGiftDirection;
}

export interface OrderGiftTokenForm {
  token: string;
}
