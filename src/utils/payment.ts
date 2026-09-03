import type { PaymentInfo } from "@/api/pay";

export type PaymentInvokeResult = "success" | "cancelled" | "unavailable" | "failed";

interface WechatInvokeParams {
  timeStamp: string;
  nonceStr: string;
  package: string;
  signType: string;
  paySign: string;
}

function parseInvokeParams(value: PaymentInfo["invokeParams"]): WechatInvokeParams | undefined {
  if (!value) return undefined;
  const keys = ["timeStamp", "nonceStr", "package", "signType", "paySign"] as const;
  if (keys.some((key) => typeof value[key] !== "string" || !value[key])) return undefined;
  return Object.fromEntries(keys.map((key) => [key, value[key]])) as unknown as WechatInvokeParams;
}

/** 调起微信支付；支付结果仍以服务端查询/回调为准。 */
export async function invokeWechatPayment(payment: PaymentInfo): Promise<PaymentInvokeResult> {
  if (payment.channel === "mock") return "unavailable";
  if (!payment.invokeParams) {
    if (!import.meta.env.DEV) {
      uni.showToast({ title: "请在微信小程序内完成支付", icon: "none" });
    }
    return "unavailable";
  }
  const params = parseInvokeParams(payment.invokeParams);
  if (!params) {
    uni.showToast({ title: "支付参数无效，请稍后重试", icon: "none" });
    return "failed";
  }

  // #ifdef MP-WEIXIN
  try {
    await uni.requestPayment({ provider: "wxpay", ...params });
    return "success";
  } catch (error) {
    const message = String((error as { errMsg?: string })?.errMsg ?? error);
    if (/cancel/i.test(message)) {
      uni.showToast({ title: "已取消支付", icon: "none" });
      return "cancelled";
    }
    uni.showToast({ title: "微信支付调起失败，请稍后重试", icon: "none" });
    return "failed";
  }
  // #endif

  // #ifndef MP-WEIXIN
  return "unavailable";
  // #endif
}
