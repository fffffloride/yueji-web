<template>
  <YjPage :tabbar="RoutePath.MINE" :padded="false">
    <YjMineMemberCard
      :member="mineMember"
      :nickname="userStore.userInfo.nickname"
      :logged-in="userStore.isLoggedIn"
      @consult="handleConsult"
      @more="handleComingSoon"
      @scan="handleComingSoon"
      @login="handleEntryClick(RoutePath.USER_MEMBER)"
      @member="handleEntryClick(RoutePath.USER_MEMBER)"
      @unlock="handleEntryClick(RoutePath.USER_MEMBER)"
      @challenge="handleEntryClick(RoutePath.USER_MEMBER)"
      @stat="handleStatClick"
    />

    <!-- 快捷工具 -->
    <view class="mine-section">
      <YjQuickEntry :items="quickTools" @click="handleQuickTool" />
    </view>

    <!-- 邀请有礼 -->
    <view class="mine-section">
      <YjInviteCard
        :info="mineInvite"
        @detail="handleEntryClick(RoutePath.DISTRIBUTION)"
        @invite="handleEntryClick(RoutePath.DISTRIBUTION)"
      />
    </view>

    <!-- 服务入口 -->
    <view class="mine-section">
      <YjMineServiceGrid :items="mineServices" @select="handleServiceSelect" />
    </view>

    <!-- 社群二维码 -->
    <view class="mine-section">
      <YjCommunityCard :info="mineCommunity" @longpress="handleComingSoon" />
    </view>

    <!-- 专属服务群 -->
    <view class="mine-section">
      <YjServiceGroupCard :group="mineServiceGroup" @join="handleComingSoon" />
    </view>

    <!-- 退出登录：未登录不展示 -->
    <view v-if="userStore.isLoggedIn" class="mine-section">
      <view class="mine-logout__button" @click="handleLogout">退出登录</view>
    </view>

    <wd-message-box />
  </YjPage>
</template>

<script setup lang="ts">
import { useMessage } from "wot-design-uni";
import { RoutePath } from "@/constants";
import {
  mineCommunity,
  mineInvite,
  mineMember,
  mineQuickTools,
  mineServiceGroup,
  mineServices,
} from "@/mocks/mine";
import { useUserStore } from "@/stores/user";
import { navigate } from "@/utils/navigate";

const userStore = useUserStore();
const message = useMessage();

/** 未登录时积分等数值显示「—」。 */
const quickTools = computed(() =>
  mineQuickTools.map((tool) => ({
    ...tool,
    value: tool.value && !userStore.isLoggedIn ? "—" : tool.value,
  }))
);

/** 快捷工具对应路由，顺序与 mineQuickTools 一致。 */
const QUICK_TOOL_ROUTES = [
  RoutePath.ORDER_LIST,
  RoutePath.USER_GIFT_CARD,
  RoutePath.USER_WALLET,
  RoutePath.USER_POINTS,
];

/** 服务入口对应路由，顺序与 mineServices 一致。 */
const SERVICE_ROUTES: { path: string; requireAuth: boolean }[] = [
  { path: RoutePath.USER_MEDICAL_RECORD, requireAuth: true },
  { path: RoutePath.USER_COMMUNITY, requireAuth: true },
  { path: RoutePath.USER_VERIFY_GIFT, requireAuth: true },
  { path: RoutePath.BRAND, requireAuth: false },
  { path: RoutePath.USER_SETTINGS, requireAuth: true },
];

/** 未登录时点击需要登录的入口先走登录流程。 */
function handleEntryClick(path: string, requireAuth = true) {
  navigate(path, { requireAuth });
}

function handleConsult() {
  navigate(RoutePath.APPOINTMENT);
}

/** 统计项：仅「待预约」有跳转，其余照设计稿无动作。 */
function handleStatClick(index: number) {
  if (index === 0) handleEntryClick(RoutePath.MY_APPOINTMENT);
}

function handleQuickTool(index: number) {
  const path = QUICK_TOOL_ROUTES[index];
  if (path) handleEntryClick(path);
}

function handleServiceSelect(index: number) {
  const route = SERVICE_ROUTES[index];
  if (route) handleEntryClick(route.path, route.requireAuth);
}

function handleComingSoon() {
  uni.showToast({ title: "敬请期待", icon: "none" });
}

/** 退出登录：二次确认后清空登录态。 */
async function handleLogout() {
  const result = await message.confirm({
    title: "退出登录",
    msg: "确定要退出当前账号吗？",
    confirmButtonText: "退出",
    cancelButtonText: "取消",
    // wd-message-box 默认 z-index 99，低于自定义 TabBar 的 500，需显式抬高
    zIndex: 600,
  });
  if (result.action === "confirm") {
    userStore.logout();
    uni.showToast({ title: "已退出登录", icon: "none" });
  }
}
</script>

<style lang="scss" scoped>
.mine-section {
  margin: 0 24rpx $spacing-md;
}

.mine-logout__button {
  padding: 28rpx 0;
  font-size: $font-size-md;
  color: $color-text-content;
  text-align: center;
  background: $color-bg;
  border: 2rpx solid $color-border;
  border-radius: $radius-card;
}
</style>
