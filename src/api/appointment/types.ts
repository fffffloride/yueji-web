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
  createTime?: string;
}

export interface AppointmentSlot {
  time: string;
  bookedCount: number;
  capacity: number;
  remainingCount: number;
  full: boolean;
  available: boolean;
}

export interface AppointmentOrderEligibility {
  eligible: boolean;
  reason: string;
}
