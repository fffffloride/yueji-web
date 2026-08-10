/** 微信支付下单返回，字段与 uni.requestPayment 入参对应。 */
export interface WxPayParams {
  timeStamp: string;
  nonceStr: string;
  /** 形如 prepay_id=xxx */
  package: string;
  signType: "MD5" | "HMAC-SHA256" | "RSA";
  paySign: string;
}

export enum PayStatusEnum {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  CLOSED = "CLOSED",
}

export interface PayStatusResult {
  orderNo: string;
  status: PayStatusEnum;
  paidAt?: string;
}
