<template>
  <wd-popup
    v-model="drawerVisible"
    position="right"
    root-portal
    :modal="false"
    :z-index="1200"
    :close-on-click-modal="false"
    custom-style="width: 100vw; height: 100vh; overflow: hidden; background: var(--yj-color-bg);"
  >
    <view class="appointment-calendar-drawer" :style="{ paddingTop: `${statusBarHeight}px` }">
      <view class="appointment-calendar-drawer__nav">
        <view class="appointment-calendar-drawer__back" @click="closeDrawer">
          <wd-icon name="arrow-left" size="44rpx" />
        </view>
        <text>选择到店时间</text>
      </view>

      <view class="appointment-calendar-drawer__weekdays">
        <text v-for="weekday in WEEKDAYS" :key="weekday">{{ weekday }}</text>
      </view>

      <scroll-view class="appointment-calendar-drawer__content" scroll-y :show-scrollbar="false">
        <view v-for="month in calendarMonths" :key="month.value" class="appointment-calendar-month">
          <view class="appointment-calendar-month__title">{{ month.label }}</view>
          <view class="appointment-calendar-month__grid">
            <view
              v-for="cell in month.cells"
              :key="cell.key"
              class="appointment-calendar-day"
              :class="{
                'appointment-calendar-day--blank': !cell.value,
                'appointment-calendar-day--disabled': cell.isDisabled,
                'appointment-calendar-day--active': cell.value === selectedDate,
              }"
              @click="selectDay(cell)"
            >
              <text v-if="cell.value">{{ cell.label }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </wd-popup>
</template>

<script setup lang="ts">
interface CalendarDay {
  key: string;
  value: string;
  label: string;
  isDisabled: boolean;
}

interface CalendarMonth {
  value: string;
  label: string;
  cells: CalendarDay[];
}

const props = defineProps<{
  modelValue: boolean;
  selectedDate: string;
  minDate: string;
  maxDate: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  select: [value: string];
}>();

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight ?? 0;
const todayValue = formatDateValue(new Date());

const drawerVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value),
});

const calendarMonths = computed(() => buildCalendarMonths(props.maxDate));

function padNumber(value: number): string {
  return String(value).padStart(2, "0");
}

function formatDateValue(date: Date): string {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
}

function parseDateValue(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function buildCalendarMonths(maxDate: string): CalendarMonth[] {
  const endDate = parseDateValue(maxDate);
  const cursor = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  const months: CalendarMonth[] = [];

  while (cursor <= endMonth) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const monthValue = `${year}-${padNumber(month + 1)}`;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const isCurrentMonth = monthValue === todayValue.slice(0, 7);
    const firstVisibleDay = isCurrentMonth ? Number(todayValue.slice(8, 10)) : 1;
    const firstVisibleDate = new Date(year, month, firstVisibleDay);
    const leadingBlankCount = (firstVisibleDate.getDay() + 6) % 7;
    const cells: CalendarDay[] = Array.from({ length: leadingBlankCount }, (_, index) => ({
      key: `${monthValue}-leading-${index}`,
      value: "",
      label: "",
      isDisabled: true,
    }));

    for (let day = firstVisibleDay; day <= daysInMonth; day += 1) {
      const value = formatDateValue(new Date(year, month, day));
      cells.push({
        key: value,
        value,
        label: value === todayValue ? "今日" : value === props.minDate ? "明日" : String(day),
        isDisabled: value < props.minDate || value > props.maxDate,
      });
    }

    while (cells.length % 7 !== 0) {
      cells.push({
        key: `${monthValue}-trailing-${cells.length}`,
        value: "",
        label: "",
        isDisabled: true,
      });
    }

    months.push({ value: monthValue, label: `${year}年${month + 1}月`, cells });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

function closeDrawer(): void {
  drawerVisible.value = false;
}

function selectDay(day: CalendarDay): void {
  if (!day.value || day.isDisabled) return;
  emit("select", day.value);
  closeDrawer();
}
</script>

<style lang="scss" scoped>
.appointment-calendar-drawer {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: $color-bg;

  &__nav {
    position: relative;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    height: $height-navbar;
    font-size: $font-size-lg;
    font-weight: 600;
    color: $color-text-title;
  }

  &__back {
    position: absolute;
    left: $spacing-md;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64rpx;
    height: 64rpx;
  }

  &__weekdays {
    display: grid;
    flex-shrink: 0;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    height: 80rpx;
    font-size: $font-size-md;
    color: $color-text-sub;
    background: $color-bg-page;

    text {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  &__content {
    flex: 1;
    width: 100%;
    min-height: 0;
  }
}

.appointment-calendar-month {
  padding: 48rpx $page-padding 16rpx;

  &__title {
    margin-bottom: $spacing-lg;
    font-size: $font-size-lg;
    font-weight: 500;
    color: $color-text-title;
    text-align: center;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 12rpx;
  }
}

.appointment-calendar-day {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  height: 104rpx;
  font-size: $font-size-md;
  color: $color-text-title;
  background: $color-bg-page;

  &--blank {
    background: transparent;
  }

  &--disabled {
    color: $color-text-placeholder;
  }

  &--active {
    font-weight: 600;
    color: $color-bg;
    background: $color-primary-dark;
  }
}
</style>
