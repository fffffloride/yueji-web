<template>
  <YjPage :padded="false" :has-footer="Boolean(primaryAction)">
    <view v-if="loading" class="group-status">
      <wd-loading />
      <text>正在加载拼团</text>
    </view>

    <view v-else-if="loadError || !displayTitle" class="group-status">
      <YjEmpty image="network" :text="loadError || '拼团不存在'">
        <wd-button size="small" type="primary" @click="loadPage">重新加载</wd-button>
      </YjEmpty>
    </view>

    <template v-else>
      <view class="group-hero">
        <view class="group-hero__content">
          <view class="group-hero__eyebrow">悦己拼团专享</view>
          <view class="group-hero__title">{{ displayTitle }}</view>
          <view class="group-hero__subtitle">
            {{ displaySkuName || "精选医美项目，好友一起更优惠" }}
          </view>
          <view class="group-hero__price">
            <text>{{ formatPrice(displayGroupPrice, true) }}</text>
            <text v-if="displaySkuPrice > displayGroupPrice" class="group-hero__origin">
              {{ formatPrice(displaySkuPrice, true) }}
            </text>
          </view>
        </view>
        <image
          v-if="displayImage && !imageFailed"
          class="group-hero__image"
          :src="displayImage"
          mode="aspectFill"
          @error="imageFailed = true"
        />
        <view v-else class="group-hero__image group-hero__image--empty">悦己</view>
      </view>

      <view class="group-flow">
        <view v-for="(step, index) in flowSteps" :key="step.title" class="group-flow__step">
          <view class="group-flow__icon">{{ index + 1 }}</view>
          <view class="group-flow__title">{{ step.title }}</view>
          <view class="group-flow__text">{{ step.text }}</view>
          <view v-if="index < flowSteps.length - 1" class="group-flow__line" />
        </view>
      </view>

      <view class="group-content">
        <view v-if="group" class="group-card">
          <view class="group-card__heading">
            <view>
              <view class="group-card__title" :class="`group-card__title--${groupTone}`">
                {{ groupStatusTitle }}
              </view>
              <view class="group-card__hint">{{ groupStatusHint }}</view>
            </view>
            <view v-if="group.status === GroupBuyStatusEnum.FORMING" class="group-card__countdown">
              {{ groupCountdown }}
            </view>
          </view>

          <view class="group-members">
            <view
              v-for="(member, index) in memberSlots"
              :key="member?.id || `empty-${index}`"
              class="group-member"
            >
              <image
                v-if="member?.avatar && !failedAvatars.includes(member.id)"
                class="group-member__avatar"
                :src="member.avatar"
                mode="aspectFill"
                @error="failedAvatars.push(member.id)"
              />
              <view v-else class="group-member__avatar group-member__avatar--empty">
                {{ member ? member.nickname?.slice(0, 1) || "悦" : "+" }}
              </view>
              <view class="group-member__name">{{ member?.nickname || "待加入" }}</view>
              <view v-if="member" class="group-member__state">
                {{ memberStatusLabel(member.status) }}
              </view>
            </view>
          </view>

          <view class="group-card__progress">
            <view class="group-card__progress-bar">
              <view class="group-card__progress-value" :style="{ width: `${paidProgress}%` }" />
            </view>
            <text>已支付 {{ group.paidPeople }}/{{ group.requiredPeople }} 人</text>
          </view>

          <view v-if="group.status === GroupBuyStatusEnum.FAILED" class="group-card__notice">
            未付款订单会自动取消，已付款订单由服务端原路退款，请以最新订单状态为准。
          </view>
        </view>

        <view v-else class="entry-card">
          <view class="entry-card__title">{{ activity?.requiredPeople }} 人成团</view>
          <view class="entry-card__meta">
            <text>活动剩余</text>
            <text class="entry-card__countdown">{{ activityCountdown }}</text>
          </view>
          <view class="entry-card__price"> 拼团价 {{ formatPrice(displayGroupPrice, true) }} </view>
        </view>

        <view v-if="!group && availableGroups.length" class="available-card">
          <view class="section-title">可直接参与的拼团</view>
          <view v-for="item in availableGroups" :key="item.id" class="available-group">
            <view class="available-group__main">
              <view class="available-group__avatar">团</view>
              <view>
                <view class="available-group__title">
                  还差 {{ remainingPeople(item.requiredPeople, item.paidPeople) }} 人成团
                </view>
                <view class="available-group__meta">
                  {{ item.occupiedPeople }}/{{ item.requiredPeople }} 人已占位 ·
                  {{ countdownFor(item.expireTime) }}
                </view>
              </view>
            </view>
            <wd-button
              size="small"
              type="primary"
              :loading="submitting === item.id"
              :disabled="Boolean(submitting)"
              @click="joinGroup(item.id)"
            >
              去参团
            </wd-button>
          </view>
        </view>

        <view class="rules-card">
          <view class="section-title">拼团规则</view>
          <view v-for="(rule, index) in rules" :key="rule" class="rule-item">
            <text class="rule-item__index">{{ index + 1 }}</text>
            <text>{{ rule }}</text>
          </view>
        </view>
      </view>
    </template>

    <template #footer>
      <view v-if="primaryAction" class="group-footer">
        <view class="group-footer__price">
          <text>拼团价</text>
          <text>{{ formatPrice(displayGroupPrice, true) }}</text>
        </view>
        <wd-button
          class="group-footer__button"
          type="primary"
          :loading="Boolean(submitting)"
          :disabled="Boolean(submitting)"
          @click="handlePrimaryAction"
        >
          {{ primaryActionLabel }}
        </wd-button>
      </view>
    </template>
  </YjPage>
</template>

<script setup lang="ts">
import GroupBuyAPI, {
  GroupBuyMemberStatusEnum,
  GroupBuyStatusEnum,
  type GroupBuyActivity,
  type GroupBuyGroupDetail,
  type GroupBuyMember,
  type GroupBuyOrderResult,
} from "@/api/group-buy";
import PayAPI from "@/api/pay";
import { RoutePath } from "@/constants";
import { useLogin } from "@/composables/useLogin";
import { useUserStore } from "@/stores/user";
import { isLoggedIn } from "@/utils/auth";
import { buildQuery, formatPrice } from "@/utils/format";
import { formatCountdown, remainingPeople, remainingSeconds } from "@/utils/group-buy";
import { navigate } from "@/utils/navigate";
import { invokeWechatPayment } from "@/utils/payment";

const flowSteps = [
  { title: "支付开团", text: "完成付款" },
  { title: "邀请参团", text: "好友参与" },
  { title: "人数满员", text: "自动成团" },
];
const rules = [
  "每个活动绑定一个商品规格，拼团价不叠加会员折扣、优惠券或积分。",
  "开团或参团都会创建待付款订单，待付款和已付款成员共同占用名额。",
  "仅已支付人数计入成团人数，达到活动要求后自动成团。",
  "超过页面所示截止时间仍未成团，未付款订单自动取消，已付款订单原路退款。",
  "同一会员不能重复加入同一拼团；活动结束、团已满或库存不足时不能参与。",
];

const activity = ref<GroupBuyActivity>();
const group = ref<GroupBuyGroupDetail>();
const activityId = ref("");
const groupId = ref("");
const loading = ref(false);
const loadError = ref("");
const submitting = ref("");
const imageFailed = ref(false);
const failedAvatars = ref<string[]>([]);
const now = ref(Date.now());
const loadedOnce = ref(false);
const expiryRefreshKey = ref("");
let timer: ReturnType<typeof setInterval> | undefined;

const userStore = useUserStore();
const { ensureLogin } = useLogin();

const displayTitle = computed(() => activity.value?.name || group.value?.activityName || "");
const displaySkuName = computed(() => activity.value?.skuName || activity.value?.productName || "");
const displayImage = computed(() => activity.value?.productImage || "");
const displayGroupPrice = computed(
  () => activity.value?.groupPrice ?? group.value?.groupPrice ?? 0
);
const displaySkuPrice = computed(() => activity.value?.skuPrice ?? displayGroupPrice.value);
const activityCountdown = computed(() =>
  activity.value ? formatCountdown(remainingSeconds(activity.value.endTime, now.value)) : "00:00:00"
);
const groupRemainingSeconds = computed(() =>
  group.value ? remainingSeconds(group.value.expireTime, now.value) : 0
);
const groupCountdown = computed(() => formatCountdown(groupRemainingSeconds.value));
const availableGroups = computed(() =>
  (activity.value?.groups ?? []).filter(
    (item) =>
      item.status === GroupBuyStatusEnum.FORMING &&
      item.occupiedPeople < item.requiredPeople &&
      remainingSeconds(item.expireTime, now.value) > 0
  )
);
const currentMember = computed(() =>
  group.value?.members.find((member) => member.memberId === userStore.userInfo.id)
);
const memberSlots = computed<Array<GroupBuyMember | undefined>>(() => {
  if (!group.value) return [];
  const length = Math.max(group.value.requiredPeople, group.value.members.length);
  return Array.from({ length }, (_, index) => group.value?.members[index]);
});
const paidProgress = computed(() =>
  group.value ? Math.min(100, (group.value.paidPeople / group.value.requiredPeople) * 100) : 0
);
const groupStatusTitle = computed(() => {
  if (!group.value) return "";
  if (group.value.status === GroupBuyStatusEnum.SUCCESS) return "拼团成功";
  if (group.value.status === GroupBuyStatusEnum.FAILED) return "拼团失败";
  return `还差 ${remainingPeople(group.value.requiredPeople, group.value.paidPeople)} 人成团`;
});
const groupStatusHint = computed(() => {
  if (!group.value) return "";
  if (group.value.status === GroupBuyStatusEnum.SUCCESS) return "成员已齐，项目将按订单正常履约";
  if (group.value.status === GroupBuyStatusEnum.FAILED)
    return "本团已到截止时间，退款状态以订单为准";
  return `已有 ${group.value.occupiedPeople} 人占位，${group.value.paidPeople} 人完成支付`;
});
const groupTone = computed(() => {
  if (group.value?.status === GroupBuyStatusEnum.SUCCESS) return "success";
  if (group.value?.status === GroupBuyStatusEnum.FAILED) return "failed";
  return "forming";
});
const primaryAction = computed<"start" | "join" | "pay" | "">(() => {
  if (!group.value) {
    return activity.value && remainingSeconds(activity.value.endTime, now.value) > 0 ? "start" : "";
  }
  if (currentMember.value?.status === GroupBuyMemberStatusEnum.PENDING) return "pay";
  if (
    !currentMember.value &&
    group.value.status === GroupBuyStatusEnum.FORMING &&
    group.value.occupiedPeople < group.value.requiredPeople &&
    groupRemainingSeconds.value > 0
  )
    return "join";
  return "";
});
const primaryActionLabel = computed(() =>
  primaryAction.value === "start"
    ? "发起拼团"
    : primaryAction.value === "join"
      ? "参与拼团"
      : "继续支付"
);

function memberStatusLabel(status: GroupBuyMemberStatusEnum): string {
  return ["待支付", "已支付", "已退款", "已取消"][status] || "未知";
}

function countdownFor(expireTime: string): string {
  return formatCountdown(remainingSeconds(expireTime, now.value));
}

function detailUrl(): string {
  return `${RoutePath.GROUP_BUY_DETAIL}${buildQuery({
    activityId: activityId.value || undefined,
    groupId: groupId.value || undefined,
  })}`;
}

async function loadPage() {
  if (loading.value) return;
  loading.value = true;
  loadError.value = "";
  try {
    if (groupId.value) {
      group.value = await GroupBuyAPI.getGroup(groupId.value);
      activityId.value = group.value.activityId;
      try {
        activity.value = await GroupBuyAPI.getActivity(activityId.value, true);
      } catch {
        activity.value = undefined;
      }
    } else if (activityId.value) {
      activity.value = await GroupBuyAPI.getActivity(activityId.value);
      group.value = undefined;
    } else {
      throw new Error("拼团参数不完整");
    }
    if (!userStore.userInfo.id && isLoggedIn()) {
      try {
        await userStore.fetchUserInfo();
      } catch {
        // 公开页面不因会员资料失效而加载失败。
      }
    }
    loadedOnce.value = true;
  } catch (error) {
    activity.value = undefined;
    group.value = undefined;
    loadError.value = error instanceof Error ? error.message : "拼团加载失败";
  } finally {
    loading.value = false;
  }
}

async function refreshGroup() {
  if (!groupId.value || loading.value) return;
  try {
    group.value = await GroupBuyAPI.getGroup(groupId.value);
  } catch {
    // 页面保留最近一次可用数据，统一请求层已给出错误提示。
  }
}

async function goToPayment(result: Pick<GroupBuyOrderResult, "groupId" | "orderId" | "orderNo">) {
  try {
    const payment = await PayAPI.create(result.orderId);
    await invokeWechatPayment(payment);
    navigate(RoutePath.ORDER_PAY_RESULT, {
      redirect: true,
      params: {
        orderId: result.orderId,
        paymentNo: payment.paymentNo,
        orderNo: result.orderNo || undefined,
        groupId: result.groupId,
      },
    });
  } catch (error) {
    navigate(RoutePath.GROUP_BUY_DETAIL, {
      redirect: true,
      params: { groupId: result.groupId },
    });
    throw error;
  }
}

async function startGroup() {
  if (!activityId.value || !ensureLogin(detailUrl())) return;
  submitting.value = "start";
  try {
    await goToPayment(await GroupBuyAPI.start(activityId.value));
  } finally {
    submitting.value = "";
  }
}

async function joinGroup(id: string) {
  if (!ensureLogin(detailUrl())) return;
  submitting.value = id;
  try {
    await goToPayment(await GroupBuyAPI.join(id));
  } finally {
    submitting.value = "";
  }
}

async function continuePayment() {
  if (!group.value || !currentMember.value) return;
  submitting.value = "pay";
  try {
    await goToPayment({
      groupId: group.value.id,
      orderId: currentMember.value.orderId,
      orderNo: "",
    });
  } finally {
    submitting.value = "";
  }
}

function handlePrimaryAction() {
  if (primaryAction.value === "start") void startGroup();
  else if (primaryAction.value === "join" && group.value) void joinGroup(group.value.id);
  else if (primaryAction.value === "pay") void continuePayment();
}

watch(groupRemainingSeconds, (seconds) => {
  if (!group.value || group.value.status !== GroupBuyStatusEnum.FORMING || seconds > 0) return;
  const key = `${group.value.id}:${group.value.expireTime}`;
  if (expiryRefreshKey.value === key) return;
  expiryRefreshKey.value = key;
  void refreshGroup();
});

onLoad((options) => {
  activityId.value = options?.activityId ?? options?.id ?? "";
  groupId.value = options?.groupId ?? "";
  timer = setInterval(() => {
    now.value = Date.now();
  }, 1000);
  void loadPage();
});

onShow(() => {
  if (loadedOnce.value && groupId.value) void refreshGroup();
});

onPullDownRefresh(async () => {
  await loadPage();
  uni.stopPullDownRefresh();
});

onUnload(() => {
  if (timer) clearInterval(timer);
});
</script>

<style lang="scss" scoped>
.group-status {
  display: flex;
  gap: $spacing-sm;
  align-items: center;
  justify-content: center;
  min-height: 720rpx;
  color: $color-text-sub;
}

.group-hero {
  display: flex;
  min-height: 320rpx;
  padding: 48rpx $page-padding 76rpx;
  overflow: hidden;
  background: linear-gradient(135deg, #f0f6f1 0%, #d9eadf 100%);

  &__content {
    position: relative;
    z-index: 1;
    flex: 1;
    min-width: 0;
  }

  &__eyebrow {
    display: inline-flex;
    padding: 6rpx 14rpx;
    font-size: $font-size-xs;
    color: $color-primary;
    background: rgb(255 255 255 / 72%);
    border-radius: $radius-tag;
  }

  &__title {
    margin-top: $spacing-md;
    font-size: 34rpx;
    font-weight: 700;
    color: $color-primary-dark;

    @include ellipsis-multi(2);
  }

  &__subtitle {
    margin-top: $spacing-xs;
    font-size: $font-size-sm;
    color: $color-text-sub;

    @include ellipsis;
  }

  &__price {
    display: flex;
    gap: $spacing-sm;
    align-items: baseline;
    margin-top: $spacing-md;
    font-size: 40rpx;
    font-weight: 700;
    color: $color-primary;
  }

  &__origin {
    font-size: $font-size-xs;
    font-weight: 400;
    color: $color-text-placeholder;
    text-decoration: line-through;
  }

  &__image {
    display: flex;
    flex: 0 0 190rpx;
    align-items: center;
    justify-content: center;
    width: 190rpx;
    height: 190rpx;
    margin: 24rpx 0 0 $spacing-md;
    color: $color-primary;
    background: rgb(255 255 255 / 70%);
    border: 8rpx solid rgb(255 255 255 / 65%);
    border-radius: 24rpx;

    &--empty {
      letter-spacing: 6rpx;
    }
  }
}

.group-flow {
  position: relative;
  z-index: 2;
  display: flex;
  padding: 34rpx 18rpx;
  margin: -48rpx $page-padding 0;
  background: $color-bg;
  border-radius: $radius-card;
  box-shadow: 0 8rpx 30rpx rgb(26 58 40 / 8%);

  &__step {
    position: relative;
    flex: 1;
    text-align: center;
  }

  &__icon {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 46rpx;
    height: 46rpx;
    margin: 0 auto;
    font-size: $font-size-xs;
    font-weight: 700;
    color: $color-primary;
    background: #eff6f1;
    border-radius: 50%;
  }

  &__line {
    position: absolute;
    top: 22rpx;
    left: calc(50% + 30rpx);
    width: calc(100% - 60rpx);
    border-top: 2rpx dashed $color-border;
  }

  &__title {
    margin-top: 12rpx;
    font-size: $font-size-sm;
    font-weight: 600;
    color: $color-text-content;
  }

  &__text {
    margin-top: 4rpx;
    font-size: 20rpx;
    color: $color-text-placeholder;
  }
}

.group-content {
  padding: $spacing-md $page-padding $spacing-lg;
}

.group-card,
.entry-card,
.available-card,
.rules-card {
  padding: $spacing-lg;
  margin-top: $spacing-md;
  background: $color-bg;
  border-radius: $radius-card;
}

.group-card {
  &__heading {
    display: flex;
    gap: $spacing-md;
    align-items: flex-start;
    justify-content: space-between;
  }

  &__title {
    font-size: $font-size-lg;
    font-weight: 700;

    &--forming {
      color: $color-primary;
    }

    &--success {
      color: $color-success;
    }

    &--failed {
      color: $color-text-placeholder;
    }
  }

  &__hint {
    margin-top: $spacing-xs;
    font-size: $font-size-sm;
    color: $color-text-sub;
  }

  &__countdown {
    flex-shrink: 0;
    padding: 8rpx 12rpx;
    font-size: $font-size-xs;
    color: $color-primary;
    background: #eff6f1;
    border-radius: $radius-input;
  }

  &__progress {
    display: flex;
    gap: $spacing-md;
    align-items: center;
    margin-top: $spacing-lg;
    font-size: $font-size-xs;
    color: $color-text-sub;
  }

  &__progress-bar {
    flex: 1;
    height: 12rpx;
    overflow: hidden;
    background: $color-bg-page;
    border-radius: 6rpx;
  }

  &__progress-value {
    height: 100%;
    background: $color-primary-light;
    border-radius: 6rpx;
  }

  &__notice {
    padding: $spacing-sm;
    margin-top: $spacing-md;
    font-size: $font-size-xs;
    line-height: 1.6;
    color: $color-text-sub;
    background: $color-bg-page;
    border-radius: $radius-input;
  }
}

.group-members {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-md $spacing-sm;
  margin-top: 40rpx;
}

.group-member {
  min-width: 0;
  text-align: center;

  &__avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 88rpx;
    height: 88rpx;
    margin: 0 auto;
    color: $color-primary;
    background: #eef5f0;
    border: 2rpx solid #d8e6dc;
    border-radius: 50%;

    &--empty {
      font-size: $font-size-lg;
      border-style: dashed;
    }
  }

  &__name {
    margin-top: $spacing-xs;
    font-size: $font-size-xs;
    color: $color-text-content;

    @include ellipsis;
  }

  &__state {
    margin-top: 2rpx;
    font-size: 20rpx;
    color: $color-text-placeholder;
  }
}

.entry-card {
  &__title {
    font-size: $font-size-lg;
    font-weight: 700;
    color: $color-primary-dark;
  }

  &__meta {
    display: flex;
    gap: $spacing-sm;
    align-items: center;
    margin-top: $spacing-md;
    font-size: $font-size-sm;
    color: $color-text-sub;
  }

  &__countdown {
    font-weight: 600;
    color: $color-primary;
  }

  &__price {
    margin-top: $spacing-sm;
    font-weight: 600;
    color: $color-price;
  }
}

.section-title {
  font-size: $font-size-lg;
  font-weight: 700;
  color: $color-text-title;
}

.available-group {
  display: flex;
  gap: $spacing-md;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md 0;
  border-bottom: 1rpx solid $color-line;

  &:last-child {
    padding-bottom: 0;
    border-bottom: 0;
  }

  &__main {
    display: flex;
    gap: $spacing-sm;
    align-items: center;
    min-width: 0;
  }

  &__avatar {
    display: flex;
    flex: 0 0 72rpx;
    align-items: center;
    justify-content: center;
    width: 72rpx;
    height: 72rpx;
    color: $color-primary;
    background: #eff6f1;
    border-radius: 50%;
  }

  &__title {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $color-text-content;
  }

  &__meta {
    margin-top: 6rpx;
    font-size: 20rpx;
    color: $color-text-placeholder;
  }
}

.rule-item {
  display: flex;
  gap: $spacing-sm;
  margin-top: $spacing-md;
  font-size: $font-size-sm;
  line-height: 1.7;
  color: $color-text-sub;

  &__index {
    display: flex;
    flex: 0 0 36rpx;
    align-items: center;
    justify-content: center;
    width: 36rpx;
    height: 36rpx;
    margin-top: 2rpx;
    font-size: 20rpx;
    color: $color-primary;
    background: #eff6f1;
    border-radius: 50%;
  }
}

.group-footer {
  display: flex;
  gap: $spacing-md;
  align-items: center;

  &__price {
    display: flex;
    flex: 1;
    flex-direction: column;
    font-size: $font-size-xs;
    color: $color-text-sub;

    text:last-child {
      margin-top: 2rpx;
      font-size: $font-size-lg;
      font-weight: 700;
      color: $color-price;
    }
  }

  &__button {
    min-width: 300rpx;
  }
}
</style>
