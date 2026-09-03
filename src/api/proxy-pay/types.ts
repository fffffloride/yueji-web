import type { PaymentInfo } from "../pay";

export const ProxyPayStatus = {
  WAITING: "WAITING",
  PAYING: "PAYING",
  PAID: "PAID",
  REFUNDED: "REFUNDED",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
} as const;

export type ProxyPayStatus = (typeof ProxyPayStatus)[keyof typeof ProxyPayStatus];

export interface ProxyPayItem {
  id: string;
  productName: string;
  productImage?: string | null;
  skuName?: string | null;
  quantity: number;
}

export interface ProxyPayShare {
  token: string;
  expiresAt: string;
}

export interface ProxyPayPreview {
  status: ProxyPayStatus;
  statusLabel: string;
  ownerNickname?: string | null;
  ownerAvatar?: string | null;
  payAmount: number;
  expiresAt: string;
  items: ProxyPayItem[];
  canPay: boolean;
}

export interface ProxyPayStatusInfo {
  status: ProxyPayStatus;
  statusLabel: string;
  expiresAt: string;
  canPay: boolean;
  paidAt?: string | null;
}

export interface ProxyPayTokenForm {
  token: string;
}

export type ProxyPayPayment = PaymentInfo;
