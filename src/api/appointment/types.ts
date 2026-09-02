import type { BaseQueryParams } from "../common";

export const AppointmentStatus = {
  BOOKED: 0,
  COMPLETED: 1,
  CANCELLED: 2,
} as const;

export type AppointmentStatus = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

export const AppointmentTab = {
  PENDING_BOOKING: "PENDING_BOOKING",
  PENDING_ARRIVAL: "PENDING_ARRIVAL",
  SERVICE_RECORD: "SERVICE_RECORD",
  CANCELLED: "CANCELLED",
} as const;

export type AppointmentTab = (typeof AppointmentTab)[keyof typeof AppointmentTab];

export const PRIMARY_APPOINTMENT_TABS: AppointmentTab[] = [
  AppointmentTab.PENDING_BOOKING,
  AppointmentTab.PENDING_ARRIVAL,
  AppointmentTab.SERVICE_RECORD,
];

export function isAppointmentTab(value: unknown): value is AppointmentTab {
  return (
    typeof value === "string" && Object.values(AppointmentTab).includes(value as AppointmentTab)
  );
}

export function normalizeAppointmentTime(value: string): string {
  const match = /^(\d{2}):(\d{2})/.exec(value);
  return match ? `${match[1]}:${match[2]}` : value;
}

/** C 端最简预约提交参数。 */
export interface AppointmentCreateForm {
  /** 预约日期，格式 YYYY-MM-DD。 */
  appointmentDate: string;
  /** 预约时间，格式 HH:mm。 */
  appointmentTime: string;
  /** 订单预约时关联的订单 ID。 */
  orderId?: string;
}

/** 服务端创建成功后返回的预约记录。 */
export interface AppointmentRecord extends AppointmentCreateForm {
  id: string;
  memberId: string;
  sceneType: "CONSULTATION" | "ORDER";
  status: AppointmentStatus;
  createTime?: string;
}

export interface AppointmentSlot {
  time: string;
  bookedCount: number;
  capacity: number;
  remainingCount: number;
  availableCapacity?: number;
  full: boolean;
  available: boolean;
}

export interface AppointmentOrderEligibility {
  eligible: boolean;
  reason: string;
}

export interface AppointmentSummary {
  pendingBooking: number;
  pendingArrival: number;
  serviceRecord: number;
}

export interface AppointmentListItem {
  id: string | null;
  appointmentId: string | null;
  orderId: string | null;
  orderNo: string | null;
  sceneType: "CONSULTATION" | "ORDER";
  status: AppointmentStatus | null;
  appointmentDate: string | null;
  appointmentTime: string | null;
  productNames: string[];
  completeTime: string | null;
  cancelTime: string | null;
  cancelReason: string | null;
  createTime: string | null;
  updateTime: string | null;
  canBook: boolean;
  canCancel: boolean;
  canReschedule: boolean;
}

export interface AppointmentPageQuery extends BaseQueryParams {
  tab: AppointmentTab;
}

export interface AppointmentCancelForm {
  reason?: string;
}

export interface AppointmentRescheduleForm {
  appointmentDate: string;
  appointmentTime: string;
  reason?: string;
}
