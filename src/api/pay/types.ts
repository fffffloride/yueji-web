export enum PaymentStatusEnum {
  PENDING = 0,
  SUCCESS = 1,
  FAILED = 2,
  REFUNDED = 3,
}

export interface PaymentInfo {
  paymentNo: string;
  orderId: string;
  amount: number;
  channel: string;
  status: PaymentStatusEnum;
  thirdPartyNo?: string | null;
  paidTime?: string | null;
  invokeParams?: Record<string, unknown> | null;
}
