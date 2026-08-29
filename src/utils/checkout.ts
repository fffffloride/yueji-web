export interface CheckoutItem {
  skuId: string;
  quantity: number;
}

export type CheckoutSource = { cartIds: string[] } | { items: CheckoutItem[] };

/** 把路由参数归一成服务端订单试算/创建可直接使用的来源。 */
export function parseCheckoutSource(options?: Record<string, string>): CheckoutSource {
  const cartIds = (options?.cartIds ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (cartIds.length) return { cartIds: [...new Set(cartIds)] };

  const skuId = options?.skuId?.trim();
  if (!skuId) throw new Error("请选择要结算的商品");

  const parsed = Number(options?.quantity ?? 1);
  const quantity = Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, 99) : 1;
  return { items: [{ skuId, quantity }] };
}
