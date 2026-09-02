import assert from "node:assert/strict";
import {
  AppointmentTab,
  isAppointmentTab,
  normalizeAppointmentTime,
  PRIMARY_APPOINTMENT_TABS,
} from "../src/api/appointment/types.ts";

assert.deepEqual(PRIMARY_APPOINTMENT_TABS, [
  AppointmentTab.PENDING_BOOKING,
  AppointmentTab.PENDING_ARRIVAL,
  AppointmentTab.SERVICE_RECORD,
]);
assert.equal(isAppointmentTab(AppointmentTab.CANCELLED), true);
assert.equal(isAppointmentTab("PAID"), false);
assert.equal(normalizeAppointmentTime("14:30:00"), "14:30");
assert.equal(normalizeAppointmentTime("09:05"), "09:05");

console.log("appointment checks passed");
