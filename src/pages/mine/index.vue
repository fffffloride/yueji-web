<template>
  <YjPage :tabbar="RoutePath.MINE">
    <YjPlaceholder
      title="个人中心"
      section="3.6"
      :points="[
        '个人信息区：头像、昵称、会员等级、待预约 / 待到店 / 服务记录',
        '订单状态横向入口',
        '我的钱包、我的积分、会员中心',
        '活动中心：拼团、抽奖',
        '分享中心（仅代理商可见）',
        '常用功能：收藏、优惠券、消息、地址、帮助与客服',
      ]"
    />

    <view class="mine-orders card">
      <view
        v-for="tab in ORDER_STATUS_TABS"
        :key="tab.value"
        class="mine-orders__item"
        @click="handleEntryClick(RoutePath.ORDER_LIST)"
      >
        {{ tab.label }}
      </view>
    </view>

    <wd-cell-group border>
      <wd-cell title="会员中心" is-link @click="handleEntryClick(RoutePath.USER_MEMBER)" />
      <wd-cell title="我的钱包" is-link @click="handleEntryClick(RoutePath.USER_WALLET)" />
      <wd-cell title="我的积分" is-link @click="handleEntryClick(RoutePath.USER_POINTS)" />
      <wd-cell title="我的预约" is-link @click="handleEntryClick(RoutePath.MY_APPOINTMENT)" />
      <wd-cell
        v-if="userStore.isAgent"
        title="分享中心"
        is-link
        @click="handleEntryClick(RoutePath.DISTRIBUTION, true)"
      />
      <wd-cell title="设置" is-link @click="handleEntryClick(RoutePath.USER_SETTINGS)" />
    </wd-cell-group>
  </YjPage>
</template>

<script setup lang="ts">
import { RoutePath } from "@/constants";
import { ORDER_STATUS_TABS } from "@/enums";
import { useUserStore } from "@/stores/user";
import { navigate } from "@/utils/navigate";

const userStore = useUserStore();

/** 未登录时点击任意入口都先走登录流程。 */
function handleEntryClick(path: string, requireAgent = false) {
  navigate(path, { requireAuth: true, requireAgent });
}
</script>

<style lang="scss" scoped>
.mine-orders {
  display: flex;
  flex-wrap: wrap;
  margin: $spacing-md 0;
}

.mine-orders__item {
  width: 25%;
  padding: $spacing-sm 0;
  font-size: $font-size-sm;
  color: $color-text-sub;
  text-align: center;
}
</style>
