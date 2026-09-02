import type { BaseQueryParams } from "../common";

export interface OrderCreateItem {
  skuId: string;
  quantity: number;
}

/** 创建订单与试算共用入参。 */
export interface OrderForm {
  cartIds?: string[];
  items?: OrderCreateItem[];
  memberCouponId?: string;
  pointsToUse?: number;
  contactName?: string;
  contactMobile?: string;
  remark?: string;
}

export interface OrderQuote {
  totalAmount: number;
  memberLevelId: string | null;
  memberLevelName: string | null;
  memberDiscount: number;
  memberCouponId: string | null;
  couponName: string | null;
  couponAmount: number;
  pointsUsed: number;
  pointsDeduct: number;
  maxUsablePoints: number;
  discountAmount: number;
  payAmount: number;
}

export interface AvailableCoupon {
  memberCouponId: string;
  couponId: string;
  couponName: string | null;
  couponType: "FULL_REDUCTION" | "DISCOUNT" | "EXCHANGE" | null;
  couponAmount: number;
  thresholdAmount: number;
  validEnd: string | null;
}

export interface OrderProduct {
  id: string;
  productId: string;
  skuId: string;
  productName: string;
  productImage?: string | null;
  skuName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderAppointmentSummary {
  id: string;
  status: number;
}

export interface OrderDetail {
  id: string;
  orderNo: string;
  status: number;
  statusLabel: string;
  totalAmount: number;
  discountAmount: number;
  payAmount: number;
  createTime: string;
  contactName?: string | null;
  contactMobile?: string | null;
  remark?: string | null;
  items: OrderProduct[];
  pricing: OrderQuote;
  appointment: OrderAppointmentSummary | null;
  canBookAppointment: boolean;
}

export interface OrderListItem {
  id: string;
  orderNo: string;
  status: number;
  statusLabel: string;
  totalAmount: number;
  discountAmount: number;
  payAmount: number;
  createTime: string;
  items: OrderProduct[];
  appointment: OrderAppointmentSummary | null;
  canBookAppointment: boolean;
}

export interface OrderQueryParams extends BaseQueryParams {
  status?: number;
}
