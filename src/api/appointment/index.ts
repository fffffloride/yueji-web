import { request } from "@/utils/request";
import type {
  AppointmentCreateForm,
  AppointmentOrderEligibility,
  AppointmentRecord,
  AppointmentSlot,
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
};

export default AppointmentAPI;
export * from "./types";
