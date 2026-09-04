import { ref } from "vue";

/** 补充 H5 鼠标拖动；触摸与触控板继续交给原生 scroll-view。 */
export function useAppointmentDateScroll() {
  const scrollLeft = ref(0);
  let origin: { x: number; left: number; target: HTMLElement } | undefined;
  let dragged = false;

  return {
    scrollLeft,
    onScroll(event: { detail: { scrollLeft: number } }) {
      scrollLeft.value = event.detail.scrollLeft;
    },
    onPointerDown(event: PointerEvent) {
      dragged = false;
      origin = undefined;
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      origin = {
        x: event.clientX,
        left: scrollLeft.value,
        target: event.currentTarget as HTMLElement,
      };
    },
    onPointerMove(event: PointerEvent) {
      if (!origin || !(event.buttons & 1)) return;
      const delta = origin.x - event.clientX;
      if (!dragged && Math.abs(delta) < 5) return;
      if (!dragged) origin.target.setPointerCapture(event.pointerId);
      dragged = true;
      event.preventDefault();
      scrollLeft.value = Math.max(0, origin.left + delta);
    },
    onPointerUp() {
      origin = undefined;
    },
    onClickCapture(event: MouseEvent) {
      if (dragged && event.detail !== 0) {
        event.preventDefault();
        event.stopPropagation();
      }
      dragged = false;
    },
  };
}
