import assert from "node:assert/strict";
import { useAppointmentDateScroll } from "../src/composables/useAppointmentDateScroll.ts";
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

// 鼠标拖动更新横向位置，轻点/触摸不被接管，拖动结束不误选日期。
const drag = useAppointmentDateScroll();
let captured = false;
let prevented = false;
let stopped = false;
const pointer = (overrides = {}) =>
  ({
    pointerType: "mouse",
    button: 0,
    buttons: 1,
    pointerId: 1,
    clientX: 200,
    currentTarget: {
      setPointerCapture: () => {
        captured = true;
      },
    },
    preventDefault: () => {
      prevented = true;
    },
    ...overrides,
  }) as unknown as PointerEvent;
drag.onScroll({ detail: { scrollLeft: 80 } });
drag.onPointerDown(pointer());
drag.onPointerMove(pointer({ clientX: 198 }));
assert.equal(drag.scrollLeft.value, 80);
assert.equal(captured, false);
drag.onPointerMove(pointer({ clientX: 100 }));
assert.equal(drag.scrollLeft.value, 180);
assert.equal(captured, true);
drag.onPointerUp();
drag.onClickCapture({
  detail: 1,
  preventDefault() {},
  stopPropagation() {
    stopped = true;
  },
} as MouseEvent);
assert.equal(stopped, true);
drag.onPointerMove(pointer({ clientX: 50 }));
assert.equal(drag.scrollLeft.value, 180);
drag.onPointerDown(pointer());
drag.onPointerMove(pointer({ clientX: 500 }));
assert.equal(drag.scrollLeft.value, 0);
drag.onPointerUp();
prevented = false;
drag.onPointerDown(pointer({ pointerType: "touch" }));
drag.onPointerMove(pointer({ pointerType: "touch", clientX: 100 }));
assert.equal(drag.scrollLeft.value, 0);
assert.equal(prevented, false);

console.log("appointment checks passed");
