/** C 端最简预约提交参数。 */
export interface AppointmentCreateForm {
  /** 预约日期，格式 YYYY-MM-DD。 */
  appointmentDate: string;
  /** 预约时间，格式 HH:mm。 */
  appointmentTime: string;
}

/** 服务端创建成功后返回的预约记录。 */
export interface AppointmentRecord extends AppointmentCreateForm {
  id: string;
  memberId: string;
  createTime?: string;
}
