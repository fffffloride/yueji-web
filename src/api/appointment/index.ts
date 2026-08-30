import { request } from "@/utils/request";
import type { AppointmentCreateForm, AppointmentRecord } from "./types";

const APPOINTMENT_BASE_URL = "/app/appointments";

const AppointmentAPI = {
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
