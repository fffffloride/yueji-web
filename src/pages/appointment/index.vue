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

      <view
        class="appointment-calendar"
        @click="openCalendarDrawer"
      >
        <view class="appointment-calendar__content">
          <wd-icon name="calendar" size="42rpx" />
          <text>日历</text>
        </view>
      </view>
    </view>

    <view class="appointment-time-section">
      <view class="appointment-time-section__heading">
        <text>选择预约时间</text>
        <text>{{ selectedDateText }}</text>
      </view>

      <view class="appointment-time-grid">
        <button
          v-for="time in timeOptions"
          :key="time"
          class="appointment-time"
          :class="{ 'appointment-time--active': selectedTime === time }"
          :disabled="submitting"
          @click="selectedTime = time"
        >
          {{ time }}
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
        :disabled="!selectedTime || submitting"
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
import AppointmentAPI from "@/api/appointment";
import { RoutePath } from "@/constants";
import { isLoggedIn } from "@/utils/auth";
import { toLogin } from "@/utils/navigate";
import AppointmentCalendarDrawer from "./components/AppointmentCalendarDrawer.vue";

interface DateOption {
  value: string;
  caption: string;
  label: string;
}

const WEEK_LABELS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const TIME_OPTIONS = [
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
];
const today = startOfDay(new Date());
const tomorrow = addDays(today, 1);
const maxBookableDate = addMonthsClamped(today, 2);
const minDate = formatDateValue(tomorrow);
const maxDate = formatDateValue(maxBookableDate);
const selectedDate = ref(minDate);
const selectedTime = ref("");
const submitting = ref(false);
const calendarDrawerVisible = ref(false);
const dateScrollIntoView = ref(dateDomId(minDate));
const dateDragging = ref(false);
let dateDragStartX = 0;
let dateDragStartScrollLeft = 0;
let h5DateScrollElement: HTMLElement | null = null;
const timeOptions = TIME_OPTIONS;
const dateOptions = buildDateOptions(tomorrow, maxBookableDate);

const selectedDateText = computed(() => {
  const current = dateOptions.find((date) => date.value === selectedDate.value);
  return current ? `${current.caption} ${current.label}` : selectedDate.value;
});

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
    dateDragStartScrollLeft - (event.clientX - dateDragStartX),
  );
}

function endDateDrag(event: PointerEvent): void {
  if (!dateDragging.value || !h5DateScrollElement) return;
  h5DateScrollElement.releasePointerCapture(event.pointerId);
  dateDragging.value = false;
}

function bindH5DateDrag(): void {
  const elements = document.querySelectorAll<HTMLElement>(
    ".appointment-date-bar__scroll .uni-scroll-view",
  );
  h5DateScrollElement = Array.from(elements).find(
    (element) => element.scrollWidth > element.clientWidth,
  ) ?? null;
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
}

function openCalendarDrawer(): void {
  calendarDrawerVisible.value = true;
}

async function submitAppointment(): Promise<void> {
  if (!selectedTime.value || submitting.value) return;
  if (!isLoggedIn()) {
    toLogin(RoutePath.APPOINTMENT);
    return;
  }

  submitting.value = true;
  try {
    await AppointmentAPI.create({
      appointmentDate: selectedDate.value,
      appointmentTime: selectedTime.value,
    });
    const confirmedTime = selectedTime.value;
    selectedTime.value = "";
    await uni.showModal({
      title: "预约成功",
      content: `已预约 ${selectedDateText.value} ${confirmedTime}，请按时到店。`,
      showCancel: false,
      confirmText: "知道了",
    });
  } finally {
    submitting.value = false;
  }
}

onBackPress(() => {
  if (!calendarDrawerVisible.value) return false;
  calendarDrawerVisible.value = false;
  return true;
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

.appointment-time-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18rpx 20rpx;
}

.appointment-time {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 86rpx;
  padding: 0;
  margin: 0;
  font-size: $font-size-md;
  line-height: 86rpx;
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
