/** 医生类型，对应需求 3.2.6 / 3.8.1。 */
export enum DoctorTypeEnum {
  /** 大师医生 */
  MASTER = "MASTER",
  /** 注射医生 */
  INJECTION = "INJECTION",
  /** 光电医生 */
  PHOTOELECTRIC = "PHOTOELECTRIC",
}

export const DOCTOR_TYPE_LABEL: Record<DoctorTypeEnum, string> = {
  [DoctorTypeEnum.MASTER]: "大师医生",
  [DoctorTypeEnum.INJECTION]: "注射医生",
  [DoctorTypeEnum.PHOTOELECTRIC]: "光电医生",
};

/** 预约状态，对应需求 3.8.4 我的预约。 */
export enum AppointmentStatusEnum {
  /** 待预约：已下单未选时间 */
  PENDING = "PENDING",
  /** 待到店：已预约未核销 */
  BOOKED = "BOOKED",
  /** 服务记录：已完成 */
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatusEnum, string> = {
  [AppointmentStatusEnum.PENDING]: "待预约",
  [AppointmentStatusEnum.BOOKED]: "待到店",
  [AppointmentStatusEnum.COMPLETED]: "服务记录",
  [AppointmentStatusEnum.CANCELLED]: "已取消",
};
