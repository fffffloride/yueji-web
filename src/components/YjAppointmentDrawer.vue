<template>
  <wd-popup
    v-model="drawerVisible"
    position="bottom"
    root-portal
    safe-area-inset-bottom
    :z-index="1100"
    :close-on-click-modal="!submitting"
    custom-style="border-radius: 28rpx 28rpx 0 0; overflow: hidden;"
  >
    <view class="appointment-drawer">
      <view class="appointment-drawer__header">
        <view>
          <view class="appointment-drawer__title">{{ drawerTitle }}</view>
          <view v-if="mode === 'reschedule'" class="appointment-drawer__subtitle">
            原时间：{{ originalDate }} {{ normalizedOriginalTime }}
          </view>
        </view>
        <wd-icon name="close" size="42rpx" @click="close" />
      </view>

      <scroll-view class="appointment-drawer__body" scroll-y :show-scrollbar="false">
        <view v-if="orderId && mode === 'create'" class="appointment-drawer__order">
          <view class="appointment-drawer__order-title">
            <text>订单预约</text>
            <text v-if="orderDetail">{{ orderDetail.orderNo }}</text>
          </view>
          <view v-if="orderLoading" class="appointment-drawer__state">
            <wd-loading size="32rpx" />
            <text>正在读取订单信息</text>
          </view>
          <template v-else-if="orderDetail">
            <view class="appointment-drawer__products">{{ orderProductNames }}</view>
            <view v-if="orderError" class="appointment-drawer__error">{{ orderError }}</view>
          </template>
          <view v-else class="appointment-drawer__error">
            {{ orderError || "订单信息不可用" }}
          </view>
        </view>

        <view class="appointment-drawer__section-title">
          <text>选择日期</text>
          <text>{{ selectedDateText }}</text>
        </view>
        <view class="appointment-drawer__dates">
          <scroll-view
            class="appointment-drawer__date-scroll"
            scroll-x
            :show-scrollbar="false"
            :scroll-left="dateScrollLeft"
            @scroll="dateDrag.onScroll"
          >
            <!-- #ifdef H5 -->
            <!-- 原生节点保留 PointerEvent 字段，uni-view 会将这些字段过滤。 -->
            <div
              class="appointment-drawer__date-list"
              @pointerdown="dateDrag.onPointerDown"
              @pointermove="dateDrag.onPointerMove"
              @pointerup="dateDrag.onPointerUp"
              @pointercancel="dateDrag.onPointerUp"
              @click.capture="dateDrag.onClickCapture"
            >
              <!-- #endif -->
              <!-- #ifndef H5 -->
              <view class="appointment-drawer__date-list">
                <!-- #endif -->
                <view
                  v-for="date in dateOptions"
                  :key="date.value"
                  class="appointment-drawer__date"
                  :class="{ 'is-active': selectedDate === date.value }"
                  @click="selectDate(date.value)"
                >
                  <text>{{ date.caption }}</text>
                  <text>{{ date.label }}</text>
                </view>
                <!-- #ifndef H5 -->
              </view>
              <!-- #endif -->
              <!-- #ifdef H5 -->
            </div>
            <!-- #endif -->
          </scroll-view>
          <view class="appointment-drawer__calendar" @click="calendarVisible = true">
            <wd-icon name="calendar" size="36rpx" />
            <text>日历</text>
          </view>
        </view>

        <view class="appointment-drawer__section-title appointment-drawer__section-title--time">
          <text>选择时间</text>
        </view>
        <view v-if="slotsLoading && slots.length === 0" class="appointment-drawer__state">
          <wd-loading size="36rpx" />
          <text>正在查询可预约时间</text>
        </view>
        <view v-else-if="slotsError && slots.length === 0" class="appointment-drawer__state">
          <text>{{ slotsError }}</text>
          <text class="appointment-drawer__retry" @click="loadSlots">重新加载</text>
        </view>
        <YjEmpty v-else-if="slots.length === 0" compact text="当日暂无可预约时间" />
        <view v-else class="appointment-drawer__time-grid">
          <button
            v-for="slot in slots"
            :key="slot.time"
            class="appointment-drawer__time"
            :class="{
              'is-active': selectedTime === slot.time,
              'is-full': slot.full,
            }"
            :disabled="submitting || slotsLoading || !slot.available || !orderCanSubmit"
            @click="selectTime(slot)"
          >
            <text>{{ slot.time }}</text>
            <text v-if="slot.full" class="appointment-drawer__time-status">已约满</text>
          </button>
        </view>
      </scroll-view>

      <view class="appointment-drawer__footer">
        <view class="appointment-drawer__selection">
          {{ selectedTime ? `${selectedDateText} ${selectedTime}` : "请先选择时间段" }}
        </view>
        <wd-button
          block
          type="primary"
          size="large"
          :loading="submitting"
          :disabled="!canSubmit"
          @click="submit"
        >
          {{ mode === "reschedule" ? "确认改期" : "确认预约" }}
        </wd-button>
      </view>
    </view>

    <AppointmentCalendarDrawer
      v-model="calendarVisible"
      :selected-date="selectedDate"
      :min-date="minDate"
      :max-date="maxDate"
      @select="selectDate"
    />
  </wd-popup>
</template>

<script setup lang="ts">
import AppointmentAPI, {
  normalizeAppointmentTime,
  type AppointmentOrderEligibility,
  type AppointmentSlot,
} from "@/api/appointment";
import OrderAPI, { type OrderDetail } from "@/api/order";
import AppointmentCalendarDrawer from "@/pages/appointment/components/AppointmentCalendarDrawer.vue";
import { useAppointmentDateScroll } from "@/composables/useAppointmentDateScroll";

const dateDrag = useAppointmentDateScroll();
const dateScrollLeft = dateDrag.scrollLeft;

export type AppointmentDrawerMode = "create" | "reschedule";

interface DateOption {
  value: string;
  caption: string;
  label: string;
}

const props = withDefaults(
  defineProps<{
    visible: boolean;
    mode?: AppointmentDrawerMode;
    orderId?: string;
    appointmentId?: string;
    originalDate?: string;
    originalTime?: string;
  }>(),
  {
    mode: "create",
    orderId: "",
    appointmentId: "",
    originalDate: "",
    originalTime: "",
  }
);

const emit = defineEmits<{
  "update:visible": [value: boolean];
  success: [mode: AppointmentDrawerMode];
}>();

const WEEK_LABELS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const today = startOfDay(new Date());
const tomorrow = addDays(today, 1);
const lastBookableDay = addMonthsClamped(today, 2);
const minDate = formatDateValue(tomorrow);
const maxDate = formatDateValue(lastBookableDay);
const dateOptions = buildDateOptions(tomorrow, lastBookableDay);

const selectedDate = ref(minDate);
const selectedTime = ref("");
const slots = ref<AppointmentSlot[]>([]);
const slotsLoading = ref(false);
const slotsError = ref("");
const submitting = ref(false);
const calendarVisible = ref(false);
const orderDetail = ref<OrderDetail>();
const orderEligibility = ref<AppointmentOrderEligibility>();
const orderLoading = ref(false);
const orderError = ref("");
let slotsRequestSequence = 0;
let orderRequestSequence = 0;

const drawerVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit("update:visible", value),
});
const drawerTitle = computed(() => {
  if (props.mode === "reschedule") return "预约改期";
  return props.orderId ? "订单预约" : "预约面诊";
});
const selectedDateText = computed(() => {
  const current = dateOptions.find((date) => date.value === selectedDate.value);
  return current ? `${current.caption} ${current.label}` : selectedDate.value;
});
const orderProductNames = computed(() =>
  orderDetail.value?.items.map((item) => item.productName).join("、")
);
const normalizedOriginalTime = computed(() => normalizeAppointmentTime(props.originalTime));
const orderCanSubmit = computed(
  () => props.mode === "reschedule" || !props.orderId || orderEligibility.value?.eligible === true
);
const hasChanged = computed(
  () =>
    props.mode !== "reschedule" ||
    selectedDate.value !== props.originalDate ||
    selectedTime.value !== normalizedOriginalTime.value
);
const canSubmit = computed(
  () =>
    Boolean(selectedTime.value) &&
    orderCanSubmit.value &&
    hasChanged.value &&
    !slotsLoading.value &&
    !submitting.value
);

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addMonthsClamped(date: Date, months: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth() + months, 1);
  result.setDate(
    Math.min(date.getDate(), new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate())
  );
  return result;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function formatDateValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function buildDateOptions(start: Date, end: Date): DateOption[] {
  const options: DateOption[] = [];
  let date = new Date(start);
  let index = 0;
  while (date <= end) {
    options.push({
      value: formatDateValue(date),
      caption: `${date.getMonth() + 1}/${date.getDate()}`,
      label: index === 0 ? "明日" : WEEK_LABELS[date.getDay()],
    });
    date = addDays(date, 1);
    index += 1;
  }
  return options;
}

function close(): void {
  if (!submitting.value) drawerVisible.value = false;
}

function selectDate(value: string): void {
  if (selectedDate.value === value) return;
  selectedDate.value = value;
  selectedTime.value = "";
  void loadSlots();
}

function selectTime(slot: AppointmentSlot): void {
  if (slot.available && orderCanSubmit.value) selectedTime.value = slot.time;
}

async function loadSlots(): Promise<void> {
  const sequence = ++slotsRequestSequence;
  slotsLoading.value = true;
  slotsError.value = "";
  try {
    const result = await AppointmentAPI.getSlots(selectedDate.value);
    if (sequence !== slotsRequestSequence) return;
    slots.value = result.map((slot) => ({ ...slot, time: normalizeAppointmentTime(slot.time) }));
    if (!slots.value.some((slot) => slot.available && slot.time === selectedTime.value)) {
      selectedTime.value = "";
    }
  } catch (error) {
    if (sequence !== slotsRequestSequence) return;
    slotsError.value = error instanceof Error ? error.message : "可预约时间加载失败";
  } finally {
    if (sequence === slotsRequestSequence) slotsLoading.value = false;
  }
}

async function loadOrderContext(): Promise<void> {
  const sequence = ++orderRequestSequence;
  orderDetail.value = undefined;
  orderEligibility.value = undefined;
  orderError.value = "";
  if (!props.orderId || props.mode !== "create") return;

  orderLoading.value = true;
  try {
    const [detail, eligibility] = await Promise.all([
      OrderAPI.getDetail(props.orderId),
      AppointmentAPI.getOrderEligibility(props.orderId),
    ]);
    if (sequence !== orderRequestSequence) return;
    orderDetail.value = detail;
    orderEligibility.value = eligibility;
    orderError.value = eligibility.eligible ? "" : eligibility.reason;
  } catch (error) {
    if (sequence !== orderRequestSequence) return;
    orderError.value = error instanceof Error ? error.message : "订单不可预约";
  } finally {
    if (sequence === orderRequestSequence) orderLoading.value = false;
  }
}

async function prepare(): Promise<void> {
  selectedDate.value =
    props.originalDate >= minDate && props.originalDate <= maxDate ? props.originalDate : minDate;
  selectedTime.value = "";
  slots.value = [];
  slotsError.value = "";
  calendarVisible.value = false;
  await Promise.allSettled([loadSlots(), loadOrderContext()]);
}

async function submit(): Promise<void> {
  if (!canSubmit.value) return;
  submitting.value = true;
  try {
    if (props.mode === "reschedule") {
      if (!props.appointmentId) throw new Error("预约信息不完整");
      await AppointmentAPI.reschedule(props.appointmentId, {
        appointmentDate: selectedDate.value,
        appointmentTime: selectedTime.value,
      });
    } else {
      await AppointmentAPI.create({
        appointmentDate: selectedDate.value,
        appointmentTime: selectedTime.value,
        orderId: props.orderId || undefined,
      });
    }
    drawerVisible.value = false;
    emit("success", props.mode);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/满|容量|时段/.test(message)) await loadSlots();
  } finally {
    submitting.value = false;
  }
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) void prepare();
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.appointment-drawer {
  display: flex;
  flex-direction: column;
  height: min(86vh, 1180rpx);
  background: $color-bg;

  &__header {
    display: flex;
    flex-shrink: 0;
    align-items: flex-start;
    justify-content: space-between;
    padding: $spacing-lg $page-padding $spacing-md;
    border-bottom: 2rpx solid $color-line;
  }

  &__title {
    font-size: $font-size-lg;
    font-weight: 700;
    color: $color-text-title;
  }

  &__subtitle {
    margin-top: $spacing-xs;
    font-size: $font-size-xs;
    color: $color-text-sub;
  }

  &__body {
    flex: 1;
    min-height: 0;
    padding-bottom: $spacing-lg;
  }

  &__order {
    padding: $spacing-md $page-padding;
    background: $color-surface-warm;
  }

  &__order-title {
    display: flex;
    justify-content: space-between;
    font-size: $font-size-sm;
    font-weight: 600;
    color: $color-text-title;
  }

  &__products,
  &__error,
  &__state {
    margin-top: $spacing-xs;
    font-size: $font-size-sm;
    line-height: 1.6;
    color: $color-text-sub;
  }

  &__error {
    color: $color-danger;
  }

  &__state {
    display: flex;
    gap: $spacing-sm;
    align-items: center;
    justify-content: center;
    min-height: 150rpx;
  }

  &__retry {
    color: $color-primary;
  }

  &__section-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-lg $page-padding $spacing-md;
    font-size: $font-size-lg;
    font-weight: 600;
    color: $color-text-title;

    text:last-child {
      font-size: $font-size-sm;
      font-weight: 400;
      color: $color-text-placeholder;
    }

    &--time {
      padding-top: 40rpx;
    }
  }

  &__dates {
    display: flex;
    padding-left: $page-padding;
  }

  &__date-scroll {
    flex: 1;
    min-width: 0;
    white-space: nowrap;

    /* #ifdef H5 */
    cursor: grab;
    user-select: none;

    &:active {
      cursor: grabbing;
    }

    /* #endif */
  }

  &__date-list {
    display: inline-flex;
    gap: 12rpx;
    padding-right: 12rpx;
  }

  &__date {
    display: inline-flex;
    flex: 0 0 112rpx;
    flex-direction: column;
    gap: 8rpx;
    align-items: center;
    justify-content: center;
    height: 104rpx;
    font-size: $font-size-sm;
    color: $color-text-content;
    background: $color-bg-page;
    border-radius: $radius-input;

    &.is-active {
      color: $color-bg;
      background: $color-primary-dark;
    }
  }

  &__calendar {
    display: flex;
    flex: 0 0 104rpx;
    flex-direction: column;
    gap: 6rpx;
    align-items: center;
    justify-content: center;
    margin-right: $page-padding;
    font-size: $font-size-xs;
    color: $color-primary-dark;
    border-left: 2rpx solid $color-line;
  }

  &__time-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16rpx;
    padding: 0 $page-padding;
  }

  &__time {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 80rpx;
    padding: 0;
    margin: 0;
    font-size: $font-size-sm;
    line-height: 1.2;
    color: $color-text-content;
    background: $color-bg-page;
    border: 2rpx solid transparent;
    border-radius: $radius-input;

    &::after {
      display: none;
    }

    &.is-active {
      font-weight: 600;
      color: $color-bg;
      background: $color-primary;
    }

    &[disabled] {
      opacity: 0.52;
    }
  }

  &__time-status {
    margin-top: 4rpx;
    font-size: 20rpx;
  }

  &__footer {
    flex-shrink: 0;
    padding: $spacing-sm $page-padding $spacing-md;
    background: $color-bg;
    border-top: 2rpx solid $color-line;
  }

  &__selection {
    margin-bottom: $spacing-sm;
    font-size: $font-size-sm;
    color: $color-text-sub;
    text-align: center;
  }
}
</style>
