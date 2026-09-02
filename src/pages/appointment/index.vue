<template>
  <YjPage class="appointment-page" :tabbar="RoutePath.APPOINTMENT" :padded="false">
    <view class="appointment-date-bar">
      <scroll-view
        class="appointment-date-bar__scroll"
        :class="{ 'appointment-date-bar__scroll--dragging': dateDragging }"
        scroll-x
        :scroll-into-view="dateScrollIntoView"
        :show-scrollbar="false"
        enable-flex
      >
        <view class="appointment-date-bar__list">
          <view
            v-for="date in dateOptions"
            :id="dateDomId(date.value)"
            :key="date.value"
            class="appointment-date"
            :class="{ 'appointment-date--active': selectedDate === date.value }"
            @click="selectDate(date.value)"
          >
            <text class="appointment-date__date">{{ date.caption }}</text>
            <text class="appointment-date__week">{{ date.label }}</text>
          </view>
        </view>
      </scroll-view>

      <view class="appointment-calendar" @click="openCalendarDrawer">
        <view class="appointment-calendar__content">
          <wd-icon name="calendar" size="42rpx" />
          <text>日历</text>
        </view>
      </view>
    </view>

    <view v-if="orderId" class="appointment-order">
      <view class="appointment-order__title">
        <text>订单预约</text>
        <text v-if="orderDetail">{{ orderDetail.orderNo }}</text>
      </view>
      <view v-if="orderLoading" class="appointment-order__state">
        <wd-loading size="36rpx" />
        <text>正在读取订单信息</text>
      </view>
      <template v-else-if="orderDetail">
        <view class="appointment-order__products">{{ orderProductNames }}</view>
        <view v-if="orderError" class="appointment-order__error">{{ orderError }}</view>
      </template>
      <view v-else class="appointment-order__error">{{ orderError || "订单信息不可用" }}</view>
    </view>

    <view class="appointment-time-section">
      <view class="appointment-time-section__heading">
        <text>选择预约时间</text>
        <text>{{ selectedDateText }}</text>
      </view>

      <view v-if="slotsLoading && slots.length === 0" class="appointment-slots-state">
        <wd-loading size="40rpx" />
        <text>正在查询可预约时间</text>
      </view>
      <view v-else-if="slotsError && slots.length === 0" class="appointment-slots-state">
        <text>{{ slotsError }}</text>
        <text class="appointment-slots-state__retry" @click="loadSlots">重新加载</text>
      </view>
      <view v-else class="appointment-time-grid">
        <button
          v-for="slot in slots"
          :key="slot.time"
          class="appointment-time"
          :class="{
            'appointment-time--active': selectedTime === slot.time,
            'appointment-time--full': slot.full,
          }"
          :disabled="submitting || slotsLoading || !slot.available || !orderCanSubmit"
          @click="selectTime(slot)"
        >
          <text>{{ slot.time }}</text>
          <text v-if="slot.full" class="appointment-time__status">已约满</text>
        </button>
      </view>

      <view class="appointment-selection" :class="{ 'appointment-selection--ready': selectedTime }">
        <view>
          <text class="appointment-selection__label">预约到店时间</text>
          <text class="appointment-selection__value">
            {{ selectedTime ? `${selectedDateText} ${selectedTime}` : "请先选择时间段" }}
          </text>
        </view>
        <wd-icon :name="selectedTime ? 'check' : 'time'" size="38rpx" />
      </view>

      <wd-button
        block
        type="primary"
        size="large"
        :loading="submitting"
        :disabled="!selectedTime || submitting || slotsLoading || !orderCanSubmit"
        @click="submitAppointment"
      >
        确认预约
      </wd-button>

      <view class="appointment-tip">预约成功后，如需调整到店时间请联系客服。</view>
    </view>

    <AppointmentCalendarDrawer
      v-model="calendarDrawerVisible"
      :selected-date="selectedDate"
      :min-date="minDate"
      :max-date="maxDate"
      @select="selectDate"
    />
  </YjPage>
</template>

<script setup lang="ts">
import { onBackPress } from "@dcloudio/uni-app";
import AppointmentAPI, {
  type AppointmentOrderEligibility,
  type AppointmentSlot,
} from "@/api/appointment";
import OrderAPI, { type OrderDetail } from "@/api/order";
import { RoutePath } from "@/constants";
import { isLoggedIn } from "@/utils/auth";
import { consumeTabBarParams, toLogin } from "@/utils/navigate";
import AppointmentCalendarDrawer from "./components/AppointmentCalendarDrawer.vue";

interface DateOption {
  value: string;
  caption: string;
  label: string;
}

const WEEK_LABELS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const today = startOfDay(new Date());
const tomorrow = addDays(today, 1);
const maxBookableDate = addMonthsClamped(today, 2);
const minDate = formatDateValue(tomorrow);
const maxDate = formatDateValue(maxBookableDate);
const selectedDate = ref(minDate);
const selectedTime = ref("");
const slots = ref<AppointmentSlot[]>([]);
const slotsLoading = ref(false);
const slotsError = ref("");
const submitting = ref(false);
const orderId = ref("");
const orderDetail = ref<OrderDetail>();
const orderEligibility = ref<AppointmentOrderEligibility>();
const orderLoading = ref(false);
const orderError = ref("");
const calendarDrawerVisible = ref(false);
const dateScrollIntoView = ref(dateDomId(minDate));
const dateDragging = ref(false);
let dateDragStartX = 0;
let dateDragStartScrollLeft = 0;
let h5DateScrollElement: HTMLElement | null = null;
const dateOptions = buildDateOptions(tomorrow, maxBookableDate);
let slotsRequestSequence = 0;
let orderRequestSequence = 0;

const selectedDateText = computed(() => {
  const current = dateOptions.find((date) => date.value === selectedDate.value);
  return current ? `${current.caption} ${current.label}` : selectedDate.value;
});
const orderProductNames = computed(() =>
  orderDetail.value?.items.map((item) => item.productName).join("、")
);
const orderCanSubmit = computed(() => !orderId.value || orderEligibility.value?.eligible === true);

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addMonthsClamped(date: Date, months: number): Date {
  const targetMonth = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate();
  targetMonth.setDate(Math.min(date.getDate(), lastDay));
  return targetMonth;
}

function padNumber(value: number): string {
  return String(value).padStart(2, "0");
}

function formatDateValue(date: Date): string {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
}

function buildDateOptions(startDate: Date, endDate: Date): DateOption[] {
  const options: DateOption[] = [];
  let date = new Date(startDate);
  let index = 0;
  while (date <= endDate) {
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

function dateDomId(value: string): string {
  return `appointment-date-${value}`;
}

function startDateDrag(event: PointerEvent): void {
  if (!h5DateScrollElement || event.pointerType !== "mouse" || event.button !== 0) return;
  dateDragging.value = true;
  dateDragStartX = event.clientX;
  dateDragStartScrollLeft = h5DateScrollElement.scrollLeft;
  dateScrollIntoView.value = "";
  h5DateScrollElement.setPointerCapture(event.pointerId);
  event.preventDefault();
}

function moveDateDrag(event: PointerEvent): void {
  if (!dateDragging.value || !h5DateScrollElement) return;
  h5DateScrollElement.scrollLeft = Math.max(
    0,
    dateDragStartScrollLeft - (event.clientX - dateDragStartX)
  );
}

function endDateDrag(event: PointerEvent): void {
  if (!dateDragging.value || !h5DateScrollElement) return;
  h5DateScrollElement.releasePointerCapture(event.pointerId);
  dateDragging.value = false;
}

function bindH5DateDrag(): void {
  const elements = document.querySelectorAll<HTMLElement>(
    ".appointment-date-bar__scroll .uni-scroll-view"
  );
  h5DateScrollElement =
    Array.from(elements).find((element) => element.scrollWidth > element.clientWidth) ?? null;
  h5DateScrollElement?.addEventListener("pointerdown", startDateDrag);
  h5DateScrollElement?.addEventListener("pointermove", moveDateDrag);
  h5DateScrollElement?.addEventListener("pointerup", endDateDrag);
  h5DateScrollElement?.addEventListener("pointercancel", endDateDrag);
}

function unbindH5DateDrag(): void {
  h5DateScrollElement?.removeEventListener("pointerdown", startDateDrag);
  h5DateScrollElement?.removeEventListener("pointermove", moveDateDrag);
  h5DateScrollElement?.removeEventListener("pointerup", endDateDrag);
  h5DateScrollElement?.removeEventListener("pointercancel", endDateDrag);
  h5DateScrollElement = null;
}

function selectDate(value: string): void {
  if (selectedDate.value === value) return;
  selectedDate.value = value;
  selectedTime.value = "";
  dateScrollIntoView.value = dateDomId(value);
  void loadSlots();
}

function selectTime(slot: AppointmentSlot): void {
  if (!slot.available || !orderCanSubmit.value) return;
  selectedTime.value = slot.time;
}

async function loadSlots(): Promise<void> {
  const sequence = ++slotsRequestSequence;
  slotsLoading.value = true;
  slotsError.value = "";
  try {
    const result = await AppointmentAPI.getSlots(selectedDate.value);
    if (sequence !== slotsRequestSequence) return;
    slots.value = result;
    if (!result.some((slot) => slot.time === selectedTime.value && slot.available)) {
      selectedTime.value = "";
    }
  } catch (error) {
    if (sequence !== slotsRequestSequence) return;
    slotsError.value = error instanceof Error ? error.message : "可预约时间加载失败";
  } finally {
    if (sequence === slotsRequestSequence) slotsLoading.value = false;
  }
}

async function loadOrderContext(nextOrderId: string): Promise<void> {
  const sequence = ++orderRequestSequence;
  orderId.value = nextOrderId;
  orderDetail.value = undefined;
  orderEligibility.value = undefined;
  orderLoading.value = false;
  orderError.value = "";
  selectedTime.value = "";
  if (!nextOrderId) return;

  if (!isLoggedIn()) {
    toLogin(`${RoutePath.APPOINTMENT}?orderId=${encodeURIComponent(nextOrderId)}`);
    return;
  }

  orderLoading.value = true;
  try {
    const [detail, eligibility] = await Promise.all([
      OrderAPI.getDetail(nextOrderId),
      AppointmentAPI.getOrderEligibility(nextOrderId),
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

function openCalendarDrawer(): void {
  calendarDrawerVisible.value = true;
}

async function submitAppointment(): Promise<void> {
  if (!selectedTime.value || submitting.value || !orderCanSubmit.value) return;
  if (!isLoggedIn()) {
    const query = orderId.value ? `?orderId=${encodeURIComponent(orderId.value)}` : "";
    toLogin(`${RoutePath.APPOINTMENT}${query}`);
    return;
  }

  submitting.value = true;
  try {
    await AppointmentAPI.create({
      appointmentDate: selectedDate.value,
      appointmentTime: selectedTime.value,
      orderId: orderId.value || undefined,
    });
    const confirmedTime = selectedTime.value;
    selectedTime.value = "";
    await uni.showModal({
      title: "预约成功",
      content: `已预约 ${selectedDateText.value} ${confirmedTime}，请按时到店。`,
      showCancel: false,
      confirmText: "知道了",
    });
    await loadSlots();
    if (orderId.value) await loadOrderContext(orderId.value);
  } finally {
    submitting.value = false;
  }
}

onBackPress(() => {
  if (!calendarDrawerVisible.value) return false;
  calendarDrawerVisible.value = false;
  return true;
});

onLoad((options) => {
  void loadSlots();
  const directOrderId = String(options?.orderId ?? "");
  if (directOrderId) void loadOrderContext(directOrderId);
});

onShow(() => {
  const params = consumeTabBarParams(RoutePath.APPOINTMENT);
  if (params !== undefined) void loadOrderContext(params.orderId ?? "");
});

// #ifdef H5
onMounted(() => nextTick(bindH5DateDrag));
onBeforeUnmount(unbindH5DateDrag);
// #endif
</script>

<style lang="scss" scoped>
.appointment-page {
  min-height: calc(100vh - var(--window-top, 0px));

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(.page__body) {
    padding: 0;
    background: $color-bg;
  }
}

.appointment-date-bar {
  display: flex;
  height: 170rpx;
  padding: $spacing-md 0 $spacing-md $spacing-md;
  background: $color-bg;
  border-bottom: 1rpx solid $color-line;

  &__scroll {
    flex: 1;
    min-width: 0;
    height: 122rpx;
    white-space: nowrap;
    cursor: grab;
    user-select: none;

    &--dragging {
      cursor: grabbing;
    }
  }

  &__list {
    display: inline-flex;
    gap: 14rpx;
    padding-right: 14rpx;
  }
}

.appointment-date {
  display: inline-flex;
  flex: 0 0 122rpx;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 122rpx;
  height: 122rpx;
  color: $color-text-content;
  background: $color-bg-page;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;

  &--active {
    color: $color-bg;
    background: $color-primary-dark;
  }

  &__date {
    font-size: $font-size-md;
    font-weight: 600;
  }

  &__week {
    margin-top: 12rpx;
    font-size: $font-size-sm;
  }
}

.appointment-calendar {
  flex: 0 0 112rpx;
  height: 122rpx;
  padding-right: 12rpx;
  background: $color-bg;
  border-left: 1rpx solid $color-line;

  &__content {
    display: flex;
    flex-direction: column;
    gap: 10rpx;
    align-items: center;
    justify-content: center;
    height: 122rpx;
    font-size: $font-size-sm;
    color: $color-text-title;
  }
}

.appointment-time-section {
  padding: $spacing-lg $page-padding 48rpx;
  background: $color-bg;

  &__heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-md;

    text:first-child {
      font-size: $font-size-lg;
      font-weight: 600;
      color: $color-text-title;
    }

    text:last-child {
      font-size: $font-size-sm;
      color: $color-text-placeholder;
    }
  }
}

.appointment-order {
  padding: $spacing-md $page-padding;
  background: $color-surface-warm;
  border-bottom: 1rpx solid $color-line;

  &__title {
    display: flex;
    justify-content: space-between;
    font-size: $font-size-sm;
    font-weight: 600;
    color: $color-text-title;
  }

  &__products,
  &__state,
  &__error {
    margin-top: $spacing-xs;
    font-size: $font-size-sm;
    line-height: 1.6;
    color: $color-text-sub;
  }

  &__state {
    display: flex;
    gap: $spacing-xs;
    align-items: center;
  }

  &__error {
    color: $color-danger;
  }
}

.appointment-time-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18rpx 20rpx;
}

.appointment-slots-state {
  display: flex;
  gap: $spacing-sm;
  align-items: center;
  justify-content: center;
  min-height: 190rpx;
  font-size: $font-size-sm;
  color: $color-text-placeholder;

  &__retry {
    color: $color-primary;
  }
}

.appointment-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 86rpx;
  padding: 0;
  margin: 0;
  font-size: $font-size-md;
  line-height: 1.2;
  color: $color-text-content;
  background: $color-bg-page;
  border: 2rpx solid transparent;
  border-radius: 0;

  &::after {
    display: none;
  }

  &--active {
    font-weight: 600;
    color: $color-bg;
    background: $color-primary;
    border-color: $color-primary;
  }

  &__status {
    margin-top: 6rpx;
    font-size: 20rpx;
    line-height: 1;
  }

  &[disabled] {
    opacity: 0.55;
  }
}

.appointment-selection {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 112rpx;
  padding: 18rpx $spacing-md;
  margin: 42rpx 0 $spacing-md;
  color: $color-text-placeholder;
  background: $color-bg-page;
  border-left: 6rpx solid $color-border;

  &--ready {
    color: $color-primary;
    background: $color-primary-tint;
    border-left-color: $color-primary;
  }

  &__label,
  &__value {
    display: block;
  }

  &__label {
    font-size: $font-size-xs;
  }

  &__value {
    margin-top: 8rpx;
    font-size: $font-size-md;
    font-weight: 600;
    color: $color-text-title;
  }
}

.appointment-tip {
  margin-top: 18rpx;
  font-size: $font-size-xs;
  line-height: 1.6;
  color: $color-text-placeholder;
  text-align: center;
}
</style>
