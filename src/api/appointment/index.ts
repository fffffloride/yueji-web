import { request } from "@/utils/request";
import type { PageResult } from "../common";
import type {
  AppointmentCancelForm,
  AppointmentCreateForm,
  AppointmentListItem,
  AppointmentOrderEligibility,
  AppointmentPageQuery,
  AppointmentRecord,
  AppointmentRescheduleForm,
  AppointmentSlot,
  AppointmentSummary,
} from "./types";

const APPOINTMENT_BASE_URL = "/app/appointments";

const AppointmentAPI = {
  getSlots(appointmentDate: string) {
    return request<AppointmentSlot[]>({
      url: `${APPOINTMENT_BASE_URL}/slots`,
      params: { appointmentDate },
    });
  },

  getOrderEligibility(orderId: string) {
    return request<AppointmentOrderEligibility>({
      url: `${APPOINTMENT_BASE_URL}/order-eligibility`,
      params: { orderId },
    });
  },

  create(data: AppointmentCreateForm) {
    return request<AppointmentRecord, AppointmentCreateForm>({
      url: APPOINTMENT_BASE_URL,
      method: "POST",
      data,
    });
  },

  getSummary() {
    return request<AppointmentSummary>({ url: `${APPOINTMENT_BASE_URL}/summary` });
  },

  getPage(params: AppointmentPageQuery) {
    return request<PageResult<AppointmentListItem>>({
      url: `${APPOINTMENT_BASE_URL}/page`,
      params,
    });
  },

  cancel(id: string, data: AppointmentCancelForm = {}) {
    return request<AppointmentListItem, AppointmentCancelForm>({
      url: `${APPOINTMENT_BASE_URL}/${id}/cancel`,
      method: "POST",
      data,
    });
  },

  reschedule(id: string, data: AppointmentRescheduleForm) {
    return request<AppointmentListItem, AppointmentRescheduleForm>({
      url: `${APPOINTMENT_BASE_URL}/${id}/reschedule`,
      method: "PUT",
      data,
    });
  },
};

export default AppointmentAPI;
export * from "./types";
