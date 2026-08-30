# 个人中心页（我的）实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按蓝湖更新后的设计稿重写 TabBar「我的」页（`src/pages/mine/index.vue`），拆分为 5 个新 Yj\* 组件 + mock 数据 + 4 个占位页，悦己品牌适配。

**Architecture:** 页面只做装配（登录态、导航分发、退出登录），视觉区块全部下沉为 `src/components/Yj*.vue` 组件（easycom 自动解析，不手动注册）；静态数据集中在 `src/mocks/mine.ts`；新增入口一律走 `RoutePath` + `navigate()`。

**Tech Stack:** uni-app (Vue 3 + TS + SCSS + UnoCSS)、wot-design-uni（wd-icon / wd-message-box）、Pinia user store。

## Global Constraints

- 设计稿规范文档：`docs/superpowers/specs/2026-08-30-personal-center-design.md`（实现以本计划为准，冲突时以计划代码为准）
- 品牌适配：SOYOUNG → 悦己DLumière；主绿 `#7BC142` → `$color-primary`（#2d5a3d）；深色按钮 `#1a1a1a` → `$color-text-title`
- 金额一律整数分，展示用 `formatPrice(cents, withSymbol)`（`src/utils/format.ts`）；营销文案类金额（横幅文案）用 mock 字符串
- 颜色只引用 `variables.scss` 变量或 `--yj-*` 自定义属性，禁止硬编码 hex；字体/间距引用 `$font-size-*` / `$spacing-*`，设计稿要求超过最大档位（如昵称 48rpx）时用字面量并注释
- 750 基准、8rpx 网格：设计稿 px × 2 = rpx
- 图标用 wd-icon 名称（映射表见 spec §7）；SCSS mixin 已随 uni.scss 全局注入（`@include card` 等可用）
- 路由必须 `RoutePath` + `navigate()`，不硬编码路径字符串
- 项目无单测框架：每个任务的验证周期 = `pnpm type-check` + `pnpm lint:style`（--fix）+ 微信开发者工具人工核对（见 Task 9 清单）
- 提交遵循 Conventional Commits，scope 用 `user`，message 示例：`feat(user): 个人中心路由与占位页`

---

### Task 1: 路由常量与 4 个占位页

**Files:**
- Modify: `src/constants/routes.ts`
- Modify: `src/pages.json`
- Create: `src/pages-sub/user/gift-card/index.vue`
- Create: `src/pages-sub/user/medical-record/index.vue`
- Create: `src/pages-sub/user/community/index.vue`
- Create: `src/pages-sub/user/verify-gift/index.vue`

**Interfaces:**
- Consumes: 无（第一个任务）
- Produces: 4 个新 `RoutePath` 常量，后续任务与页面导航引用：
  - `RoutePath.USER_GIFT_CARD` = `/pages-sub/user/gift-card/index`
  - `RoutePath.USER_MEDICAL_RECORD` = `/pages-sub/user/medical-record/index`
  - `RoutePath.USER_COMMUNITY` = `/pages-sub/user/community/index`
  - `RoutePath.USER_VERIFY_GIFT` = `/pages-sub/user/verify-gift/index`

- [ ] **Step 1: routes.ts 增加 4 个常量**

在 `src/constants/routes.ts` 中，找到：

```ts
  USER_HELP: "/pages-sub/user/help/index",
```

替换为：

```ts
  USER_HELP: "/pages-sub/user/help/index",
  USER_GIFT_CARD: "/pages-sub/user/gift-card/index",
  USER_MEDICAL_RECORD: "/pages-sub/user/medical-record/index",
  USER_COMMUNITY: "/pages-sub/user/community/index",
  USER_VERIFY_GIFT: "/pages-sub/user/verify-gift/index",
```

- [ ] **Step 2: pages.json 注册 4 个页面**

在 `src/pages.json` 的 `pages-sub/user` 分包 `pages` 数组中，找到：

```json
        {
          "path": "help/index",
          "style": { "navigationBarTitleText": "帮助与客服" }
        }
```

替换为：

```json
        {
          "path": "help/index",
          "style": { "navigationBarTitleText": "帮助与客服" }
        },
        {
          "path": "gift-card/index",
          "style": { "navigationBarTitleText": "礼品卡" }
        },
        {
          "path": "medical-record/index",
          "style": { "navigationBarTitleText": "病历签署" }
        },
        {
          "path": "community/index",
          "style": { "navigationBarTitleText": "悦己圈" }
        },
        {
          "path": "verify-gift/index",
          "style": { "navigationBarTitleText": "核销有礼" }
        }
```

- [ ] **Step 3: 创建 4 个占位页**（`YjPage`/`YjPlaceholder` 走 easycom，无需 script，参照 `src/pages-sub/user/profile/index.vue` 模式）

`src/pages-sub/user/gift-card/index.vue`：

```vue
<template>
  <YjPage>
    <YjPlaceholder
      title="礼品卡"
      :points="[
        '礼品卡列表与余额展示',
        '绑定 / 赠送礼品卡',
        '卡面二维码核销',
      ]"
    />
  </YjPage>
</template>
```

`src/pages-sub/user/medical-record/index.vue`：

```vue
<template>
  <YjPage>
    <YjPlaceholder
      title="病历签署"
      :points="[
        '查看历史病历',
        '在线签署病历授权',
      ]"
    />
  </YjPage>
</template>
```

`src/pages-sub/user/community/index.vue`：

```vue
<template>
  <YjPage>
    <YjPlaceholder
      title="悦己圈"
      :points="[
        '社区动态浏览',
        '发布与互动',
      ]"
    />
  </YjPage>
</template>
```

`src/pages-sub/user/verify-gift/index.vue`：

```vue
<template>
  <YjPage>
    <YjPlaceholder
      title="核销有礼"
      :points="[
        '到店核销流程',
        '核销奖励领取',
      ]"
    />
  </YjPage>
</template>
```

- [ ] **Step 4: 验证**

Run: `pnpm type-check`
Expected: 无新增错误（占位页无 script，类型检查应通过）

Run: `node -e "JSON.parse(require('fs').readFileSync('src/pages.json','utf8')); console.log('pages.json OK')"`
Expected: `pages.json OK`

- [ ] **Step 5: Commit**

```bash
git add src/constants/routes.ts src/pages.json src/pages-sub/user/gift-card/index.vue src/pages-sub/user/medical-record/index.vue src/pages-sub/user/community/index.vue src/pages-sub/user/verify-gift/index.vue
git commit -m "feat(user): 个人中心新增礼品卡/病历签署/悦己圈/核销有礼占位页"
```

---

### Task 2: Mock 数据模块

**Files:**
- Create: `src/mocks/mine.ts`

**Interfaces:**
- Consumes: 无
- Produces: 以下类型与常量被 Task 3-8 引用（名称与字段必须完全一致）：
  - 类型：`MemberStat`、`MemberInfo`、`QuickTool`、`InviteStat`、`InviteInfo`、`ServiceEntry`、`CommunityInfo`、`ServiceGroup`
  - 常量：`mineMember`、`mineQuickTools`、`mineInvite`、`mineServices`、`mineCommunity`、`mineServiceGroup`

- [ ] **Step 1: 创建 src/mocks/mine.ts**

```ts
/**
 * 个人中心静态数据（还原设计稿阶段使用，后续替换为真实接口）。
 * 金额一律为整数分，展示时经 formatPrice 转换。
 */

/** 会员卡统计项。 */
export interface MemberStat {
  label: string;
  count: number;
}

/** 会员卡信息。 */
export interface MemberInfo {
  /** 会员等级文案，如「悦己DLumière MEMBER」 */
  levelName: string;
  /** 等级进度 0-100 */
  progress: number;
  /** 待解锁进度文案，如「0/1」 */
  lockedText: string;
  /** 挑战赛标题，如「L3会员挑战赛」 */
  challengeTitle: string;
  /** 赠送项目价值（分） */
  challengeGift: number;
  /** 挑战赛按钮文案 */
  challengeButtonText: string;
  stats: MemberStat[];
}

/** 快捷工具条目（YjQuickEntry 数据源）。 */
export interface QuickTool {
  label: string;
  /** 数值，如积分数量；有值时优先展示数值 */
  value?: string;
  /** wd-icon 图标名 */
  icon?: string;
}

/** 邀请有礼奖励统计。 */
export interface InviteStat {
  label: string;
  value: number;
  /** 金额（分）还是普通数值 */
  isMoney?: boolean;
}

/** 邀请有礼区块。 */
export interface InviteInfo {
  title: string;
  detailText: string;
  bannerText: string;
  participantsText: string;
  stats: InviteStat[];
  buttonText: string;
}

/** 服务入口。 */
export interface ServiceEntry {
  label: string;
  /** wd-icon 图标名 */
  icon: string;
}

/** 社群二维码卡。 */
export interface CommunityInfo {
  title: string;
  sub: string;
}

/** 专属服务群。 */
export interface ServiceGroup {
  title: string;
  desc: string;
  sub: string;
  joinText: string;
  benefits: string[];
}

/** 会员卡静态数据。 */
export const mineMember: MemberInfo = {
  levelName: "悦己DLumière MEMBER",
  progress: 30,
  lockedText: "0/1",
  challengeTitle: "L3会员挑战赛",
  challengeGift: 69900,
  challengeButtonText: "去报名",
  stats: [
    { label: "待预约", count: 0 },
    { label: "待到店", count: 0 },
    { label: "服务记录", count: 0 },
  ],
};

/** 快捷工具（全部订单 / 礼品卡 / 钱包 / 积分）。 */
export const mineQuickTools: QuickTool[] = [
  { label: "全部订单", icon: "list" },
  { label: "礼品卡", icon: "creditcard" },
  { label: "钱包", icon: "wallet" },
  { label: "积分", value: "0" },
];

/** 邀请有礼。 */
export const mineInvite: InviteInfo = {
  title: "邀请有礼",
  detailText: "了解详情",
  bannerText: "送您 3000 元现金！",
  participantsText: "7.8万人参与",
  stats: [
    { label: "无门槛优惠券", value: 0, isMoney: true },
    { label: "现金奖励", value: 0, isMoney: true },
    { label: "积分奖励", value: 0 },
  ],
  buttonText: "立即邀请",
};

/** 服务入口宫格。 */
export const mineServices: ServiceEntry[] = [
  { label: "病历签署", icon: "file" },
  { label: "悦己圈", icon: "info-circle" },
  { label: "核销有礼", icon: "gift" },
  { label: "关于我们", icon: "help-circle" },
  { label: "设置", icon: "setting" },
];

/** 社群二维码卡。 */
export const mineCommunity: CommunityInfo = {
  title: "长按加入悦己同好社群",
  sub: "领50元券｜城市限定好价｜同城变美搭子",
};

/** 专属服务群。 */
export const mineServiceGroup: ServiceGroup = {
  title: "悦己专属服务群",
  desc: "加入您的专属服务群",
  sub: "每周三抢大额神券，多重惊喜",
  joinText: "立即进群",
  benefits: ["真实案例对比", "7x24小时智能服务", "术后护理指南", "生日礼·核销礼·专属优惠券"],
};
```

- [ ] **Step 2: 验证**

Run: `pnpm type-check`
Expected: 无新增错误

- [ ] **Step 3: Commit**

```bash
git add src/mocks/mine.ts
git commit -m "feat(user): 个人中心 mock 数据模型与静态数据"
```

---

### Task 3: YjMineMemberCard 组件（Hero + 会员卡）+ 灰阶 token

**Files:**
- Create: `src/components/YjMineMemberCard.vue`
- Modify: `src/styles/variables.scss`（追加 2 个灰阶变量）
- Modify: `src/styles/common.scss`（追加 2 个对应 CSS 自定义属性）

**Interfaces:**
- Consumes: `MemberInfo`、`MemberStat`（`@/mocks/mine`，Task 2）；`formatPrice`（`@/utils/format`）
- Produces: 组件 `YjMineMemberCard`，props/emits 被 Task 8 引用：
  - Props：`member: MemberInfo`、`nickname: string`、`loggedIn?: boolean`（默认 false）
  - Emits：`consult`、`more`、`scan`、`login`、`member`、`unlock`、`challenge`、`stat(index: number)`

- [ ] **Step 1: variables.scss 追加灰阶变量**

在 `src/styles/variables.scss` 末尾追加：

```scss
$color-surface-gray: #d4d8dc; // 浅灰（个人中心 Hero 渐变起色）
$color-surface-gray-light: #e8eaec; // 极浅灰（个人中心 Hero 渐变收色）
```

- [ ] **Step 2: common.scss 追加对应自定义属性**

在 `src/styles/common.scss` 的 `--yj-color-surface-rose: #{$color-surface-rose};` 之后追加：

```scss
  --yj-color-surface-gray: #{$color-surface-gray};
  --yj-color-surface-gray-light: #{$color-surface-gray-light};
```

- [ ] **Step 3: 创建 src/components/YjMineMemberCard.vue**

```vue
<template>
  <view class="mine-member">
    <!-- Hero：浅灰渐变 + 水泡装饰 -->
    <view class="mine-member__hero">
      <view
        v-for="(bubble, index) in bubbles"
        :key="index"
        class="mine-member__bubble"
        :style="{
          width: `${bubble.w}rpx`,
          height: `${bubble.h}rpx`,
          top: `${bubble.t}rpx`,
          left: bubble.l !== undefined ? `${bubble.l}rpx` : undefined,
          right: bubble.r !== undefined ? `${bubble.r}rpx` : undefined,
          opacity: bubble.o,
        }"
      />
      <view class="mine-member__nav">
        <view class="mine-member__consult" @click="emit('consult')">
          <wd-icon name="chat" size="24rpx" />
          <text>咨询/预约</text>
        </view>
        <view class="mine-member__actions">
          <view class="mine-member__action-btn" @click="emit('more')">
            <wd-icon name="ellipsis" size="32rpx" />
          </view>
          <view class="mine-member__action-btn" @click="emit('scan')">
            <wd-icon name="scan" size="32rpx" />
          </view>
        </view>
      </view>
    </view>

    <!-- 会员卡 -->
    <view class="mine-member__card">
      <view class="mine-member__profile" @click="handleProfileClick">
        <view class="mine-member__nickname">{{ loggedIn ? `Hi,${nickname}` : "Hi，请登录" }}</view>
        <view class="mine-member__welcome">welcome back</view>
      </view>

      <!-- 会员进度 -->
      <view class="mine-member__progress" @click="emit('unlock')">
        <view class="mine-member__progress-row">
          <view class="mine-member__level">
            <text
              v-for="line in member.levelName.split(' ')"
              :key="line"
              class="mine-member__level-line"
            >
              {{ line }}
            </text>
          </view>
          <view class="mine-member__track">
            <view class="mine-member__fill" :style="{ width: `${member.progress}%` }" />
          </view>
        </view>
        <view class="mine-member__lock">
          <text>Lock待解锁{{ member.lockedText }}</text>
          <wd-icon name="chevron-right" size="24rpx" />
        </view>
      </view>

      <!-- L3 挑战赛 -->
      <view class="mine-member__challenge">
        <text class="mine-member__challenge-text">
          {{ member.challengeTitle }}，赠送价值{{ formatPrice(member.challengeGift, true) }}项目
        </text>
        <view class="mine-member__challenge-btn" @click.stop="emit('challenge')">
          {{ member.challengeButtonText }}
        </view>
      </view>

      <!-- 统计 -->
      <view class="mine-member__stats">
        <view
          v-for="(stat, index) in member.stats"
          :key="stat.label"
          class="mine-member__stat"
          @click="emit('stat', index)"
        >
          <text class="mine-member__stat-value">{{ !loggedIn ? "—" : stat.count }}</text>
          <text class="mine-member__stat-label">{{ stat.label }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { MemberInfo } from "@/mocks/mine";
import { formatPrice } from "@/utils/format";

const props = withDefaults(
  defineProps<{
    member: MemberInfo;
    nickname: string;
    loggedIn?: boolean;
  }>(),
  { loggedIn: false }
);

const emit = defineEmits<{
  (e: "consult"): void;
  (e: "more"): void;
  (e: "scan"): void;
  (e: "login"): void;
  (e: "member"): void;
  (e: "unlock"): void;
  (e: "challenge"): void;
  (e: "stat", index: number): void;
}>();

/** 水泡装饰位置（设计稿 px 已换算为 rpx）。 */
interface BubbleStyle {
  w: number;
  h: number;
  t: number;
  l?: number;
  r?: number;
  o: number;
}

const bubbles: BubbleStyle[] = [
  { w: 220, h: 220, t: -40, l: -40, o: 0.35 },
  { w: 160, h: 160, t: 20, l: 100, o: 0.2 },
  { w: 120, h: 120, t: -20, r: 80, o: 0.25 },
  { w: 180, h: 180, t: 60, r: -40, o: 0.3 },
];

/** 未登录点昵称区走登录，已登录进会员中心。 */
function handleProfileClick() {
  // 注意：emit(三元表达式) 会因联合类型不匹配重载而 TS2769，须写成分支
  if (props.loggedIn) {
    emit("member");
  } else {
    emit("login");
  }
}
</script>

<style lang="scss" scoped>
.mine-member__hero {
  position: relative;
  height: 280rpx;
  overflow: hidden;
  background: linear-gradient(160deg, $color-surface-gray 0%, $color-surface-gray-light 100%);
}

.mine-member__bubble {
  position: absolute;
  border: 2rpx solid rgb(255 255 255 / 60%);
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, rgb(255 255 255 / 50%), transparent 70%);
}

.mine-member__nav {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx 0;
}

.mine-member__consult {
  display: flex;
  gap: $spacing-xs;
  align-items: center;
  padding: 12rpx 24rpx;
  font-size: $font-size-sm;
  color: $color-text-content;
  background: rgb(255 255 255 / 80%);
  border-radius: $radius-button;
  box-shadow: 0 2rpx 8rpx rgb(0 0 0 / 6%);
}

.mine-member__actions {
  display: flex;
  gap: $spacing-sm;
}

.mine-member__action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56rpx;
  height: 56rpx;
  color: $color-text-content;
  background: rgb(255 255 255 / 80%);
  border-radius: 50%;
  box-shadow: 0 2rpx 8rpx rgb(0 0 0 / 6%);
}

.mine-member__card {
  position: relative;
  margin: -80rpx 24rpx 0;
  padding: 40rpx 40rpx 0;
  overflow: hidden;

  @include card;
}

.mine-member__nickname {
  font-size: 48rpx; // 设计稿 text-2xl，超过最大字体档位，按设计取值
  font-weight: 700;
  color: $color-text-title;
}

.mine-member__welcome {
  margin-bottom: $spacing-lg;
  font-size: $font-size-md;
  color: $color-text-placeholder;
}

.mine-member__progress {
  margin-bottom: $spacing-sm;
  background: $color-primary-tint;
  border-radius: 24rpx;
}

.mine-member__progress-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 24rpx;
}

.mine-member__level {
  display: flex;
  flex-direction: column;
}

.mine-member__level-line {
  font-size: 20rpx; // 设计稿 10px
  font-weight: 700;
  line-height: 1.2;
  color: $color-text-title;
}

.mine-member__track {
  flex: 1;
  height: 24rpx;
  margin-left: 24rpx;
  overflow: hidden;
  background: rgb(255 255 255 / 60%);
  border-radius: 24rpx;
}

.mine-member__fill {
  height: 100%;
  background: linear-gradient(to right, $color-primary-lighter, $color-primary);
  border-radius: 24rpx;
}

.mine-member__lock {
  display: flex;
  gap: $spacing-xs;
  align-items: center;
  justify-content: flex-end;
  padding: 0 24rpx 16rpx;
  font-size: $font-size-sm;
  color: $color-text-sub;
}

.mine-member__challenge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  background: $color-primary-tint;
  border-radius: 24rpx;
}

.mine-member__challenge-text {
  font-size: $font-size-md;
  color: $color-primary;
}

.mine-member__challenge-btn {
  padding: 12rpx 32rpx;
  font-size: $font-size-md;
  font-weight: 700;
  color: $color-bg;
  background: $color-text-title;
  border-radius: $radius-card;
}

.mine-member__stats {
  display: flex;
  margin-top: $spacing-lg;
  padding: $spacing-lg 0;
  border-top: 2rpx solid $color-line;
}

.mine-member__stat {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: $spacing-xs;
  align-items: center;
}

.mine-member__stat-value {
  font-size: 40rpx; // 设计稿 text-xl
  font-weight: 600;
  color: $color-text-title;
}

.mine-member__stat-label {
  font-size: $font-size-sm;
  color: $color-text-sub;
}
</style>
```

- [ ] **Step 4: 验证**

Run: `pnpm type-check && pnpm lint:style`
Expected: 无错误（lint:style 为 --fix 模式，允许其自动修正格式）

- [ ] **Step 5: Commit**

```bash
git add src/components/YjMineMemberCard.vue src/styles/variables.scss src/styles/common.scss
git commit -m "feat(user): 个人中心会员卡组件（Hero+会员进度+L3挑战赛+统计）"
```

---

### Task 4: YjInviteCard 组件（邀请有礼）

**Files:**
- Create: `src/components/YjInviteCard.vue`

**Interfaces:**
- Consumes: `InviteInfo`（`@/mocks/mine`，Task 2）；`formatPrice`；`YjLogo`（easycom，props `size: number`）
- Produces: 组件 `YjInviteCard`，被 Task 8 引用：
  - Props：`info: InviteInfo`
  - Emits：`detail`、`invite`

- [ ] **Step 1: 创建 src/components/YjInviteCard.vue**

```vue
<template>
  <view class="invite card">
    <view class="invite__head">
      <text class="invite__title">{{ info.title }}</text>
      <view class="invite__detail" @click="emit('detail')">
        <text>{{ info.detailText }}</text>
        <wd-icon name="chevron-right" size="24rpx" />
      </view>
    </view>

    <view class="invite__banner">
      <view class="invite__banner-body">
        <view class="invite__brand">
          <YjLogo :size="28" />
          <text class="invite__brand-name">悦己DLumière</text>
        </view>
        <text class="invite__banner-text">{{ info.bannerText }}</text>
      </view>
      <view class="invite__badge">{{ info.participantsText }}</view>
      <view class="invite__line" />
    </view>

    <view class="invite__foot">
      <view v-for="stat in info.stats" :key="stat.label" class="invite__stat">
        <text class="invite__stat-value">
          {{ stat.isMoney ? formatPrice(stat.value, true) : stat.value }}
        </text>
        <text class="invite__stat-label">{{ stat.label }}</text>
      </view>
      <view class="invite__button" @click="emit('invite')">{{ info.buttonText }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { InviteInfo } from "@/mocks/mine";
import { formatPrice } from "@/utils/format";

defineProps<{ info: InviteInfo }>();

const emit = defineEmits<{
  (e: "detail"): void;
  (e: "invite"): void;
}>();
</script>

<style lang="scss" scoped>
.invite__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: $spacing-sm;
}

.invite__title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: $color-text-title;
}

.invite__detail {
  display: flex;
  gap: $spacing-xs;
  align-items: center;
  font-size: $font-size-sm;
  color: $color-text-placeholder;
}

.invite__banner {
  position: relative;
  height: 220rpx;
  margin-bottom: $spacing-sm;
  overflow: hidden;
  background: $color-surface-rose;
  border-radius: 32rpx;
}

.invite__banner-body {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: $spacing-sm;
  padding: 32rpx;
}

.invite__brand {
  display: flex;
  gap: $spacing-xs;
  align-items: center;
}

.invite__brand-name {
  font-size: 20rpx; // 设计稿 10px
  font-weight: 700;
  color: $color-text-title;
}

.invite__banner-text {
  font-size: 40rpx; // 设计稿 text-xl
  font-weight: 900;
  color: $color-text-title;
}

.invite__badge {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  padding: 8rpx 16rpx;
  font-size: 18rpx; // 设计稿 9px
  font-weight: 700;
  color: $color-bg;
  background: $color-price;
  border-radius: 0 16rpx 0 16rpx;
}

.invite__line {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 4rpx;
  background: $color-primary;
}

.invite__foot {
  display: flex;
  gap: $spacing-sm;
  align-items: center;
}

.invite__stat {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.invite__stat-value {
  font-size: $font-size-lg;
  font-weight: 700;
  color: $color-text-title;
}

.invite__stat-label {
  font-size: $font-size-sm;
  color: $color-text-placeholder;
}

.invite__button {
  padding: 20rpx 32rpx;
  font-size: $font-size-md;
  font-weight: 700;
  color: $color-bg;
  background: $color-text-title;
  border-radius: $radius-button;
}
</style>
```

- [ ] **Step 2: 验证**

Run: `pnpm type-check && pnpm lint:style`
Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add src/components/YjInviteCard.vue
git commit -m "feat(user): 个人中心邀请有礼卡片组件"
```

---

### Task 5: YjMineServiceGrid 组件（服务入口宫格）

**Files:**
- Create: `src/components/YjMineServiceGrid.vue`

**Interfaces:**
- Consumes: `ServiceEntry`（`@/mocks/mine`，Task 2）
- Produces: 组件 `YjMineServiceGrid`，被 Task 8 引用：
  - Props：`items: ServiceEntry[]`
  - Emits：`select(index: number)`

- [ ] **Step 1: 创建 src/components/YjMineServiceGrid.vue**

```vue
<template>
  <view class="service-grid card">
    <view
      v-for="(item, index) in items"
      :key="item.label"
      class="service-grid__item"
      @click="emit('select', index)"
    >
      <wd-icon :name="item.icon" size="56rpx" />
      <text class="service-grid__label">{{ item.label }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { ServiceEntry } from "@/mocks/mine";

defineProps<{ items: ServiceEntry[] }>();

const emit = defineEmits<{
  (e: "select", index: number): void;
}>();
</script>

<style lang="scss" scoped>
.service-grid {
  display: flex;
  flex-wrap: wrap;
  color: $color-text-title;
}

.service-grid__item {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  align-items: center;
  width: 20%;
  padding: $spacing-sm 0;
}

.service-grid__label {
  font-size: $font-size-sm;
  color: $color-text-sub;
  text-align: center;
}
</style>
```

- [ ] **Step 2: 验证**

Run: `pnpm type-check && pnpm lint:style`
Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add src/components/YjMineServiceGrid.vue
git commit -m "feat(user): 个人中心服务入口宫格组件"
```

---

### Task 6: YjCommunityCard 组件（社群二维码卡）

**Files:**
- Create: `src/components/YjCommunityCard.vue`

**Interfaces:**
- Consumes: `CommunityInfo`（`@/mocks/mine`，Task 2）
- Produces: 组件 `YjCommunityCard`，被 Task 8 引用：
  - Props：`info: CommunityInfo`
  - Emits：`longpress`

- [ ] **Step 1: 创建 src/components/YjCommunityCard.vue**

```vue
<template>
  <view class="community card">
    <view class="community__body">
      <text class="community__title">{{ info.title }}</text>
      <text class="community__sub">{{ info.sub }}</text>
    </view>
    <view class="community__qr" @longpress="emit('longpress')">
      <wd-icon name="qrcode" size="80rpx" />
    </view>
  </view>
</template>

<script setup lang="ts">
import type { CommunityInfo } from "@/mocks/mine";

defineProps<{ info: CommunityInfo }>();

const emit = defineEmits<{
  (e: "longpress"): void;
}>();
</script>

<style lang="scss" scoped>
.community {
  display: flex;
  gap: $spacing-md;
  align-items: center;
}

.community__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: $spacing-xs;
}

.community__title {
  font-size: $font-size-md;
  font-weight: 600;
  color: $color-text-title;
}

.community__sub {
  font-size: $font-size-sm;
  color: $color-text-sub;
}

.community__qr {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 128rpx;
  height: 128rpx;
  color: $color-text-content;
  background: $color-bg-page;
  border: 2rpx solid $color-border;
  border-radius: $radius-card;
}
</style>
```

- [ ] **Step 2: 验证**

Run: `pnpm type-check && pnpm lint:style`
Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add src/components/YjCommunityCard.vue
git commit -m "feat(user): 个人中心社群二维码卡片组件"
```

---

### Task 7: YjServiceGroupCard 组件（专属服务群）

**Files:**
- Create: `src/components/YjServiceGroupCard.vue`

**Interfaces:**
- Consumes: `ServiceGroup`（`@/mocks/mine`，Task 2）
- Produces: 组件 `YjServiceGroupCard`，被 Task 8 引用：
  - Props：`group: ServiceGroup`
  - Emits：`join`

- [ ] **Step 1: 创建 src/components/YjServiceGroupCard.vue**

```vue
<template>
  <view class="group card">
    <view class="group__title">{{ group.title }}</view>
    <view class="group__panel">
      <view class="group__row">
        <view class="group__icon">
          <wd-icon name="heart-filled" size="32rpx" color="var(--yj-color-bg, #fff)" />
        </view>
        <view class="group__intro">
          <text class="group__desc">{{ group.desc }}</text>
          <text class="group__sub">{{ group.sub }}</text>
        </view>
        <view class="group__join" @click="emit('join')">{{ group.joinText }}</view>
      </view>
      <view class="group__benefits">
        <view v-for="benefit in group.benefits" :key="benefit" class="group__benefit">
          <wd-icon name="check-bold" size="24rpx" color="var(--yj-color-primary, #2d5a3d)" />
          <text>{{ benefit }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { ServiceGroup } from "@/mocks/mine";

defineProps<{ group: ServiceGroup }>();

const emit = defineEmits<{
  (e: "join"): void;
}>();
</script>

<style lang="scss" scoped>
.group__title {
  padding-bottom: $spacing-sm;
  font-size: $font-size-lg;
  font-weight: 600;
  color: $color-text-title;
}

.group__panel {
  padding: $spacing-lg;
  background: $color-primary-tint;
  border-radius: 32rpx;
}

.group__row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.group__icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  background: $color-primary;
  border-radius: 50%;
}

.group__intro {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: $spacing-xs;
  margin: 0 $spacing-sm;
}

.group__desc {
  font-size: $font-size-md;
  font-weight: 700;
  color: $color-text-title;
}

.group__sub {
  font-size: $font-size-sm;
  color: $color-text-sub;
}

.group__join {
  flex-shrink: 0;
  padding: 16rpx 24rpx;
  font-size: $font-size-md;
  font-weight: 700;
  color: $color-bg;
  background: $color-text-title;
  border-radius: $radius-button;
}

.group__benefits {
  display: flex;
  flex-wrap: wrap;
}

.group__benefit {
  display: flex;
  gap: $spacing-xs;
  align-items: center;
  width: 50%;
  margin-top: $spacing-md;
  font-size: $font-size-sm;
  color: $color-text-sub;
}
</style>
```

- [ ] **Step 2: 验证**

Run: `pnpm type-check && pnpm lint:style`
Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add src/components/YjServiceGroupCard.vue
git commit -m "feat(user): 个人中心专属服务群卡片组件"
```

---

### Task 8: 重写 mine/index.vue 装配页面

**Files:**
- Modify: `src/pages/mine/index.vue`（整文件重写，删除 YjPlaceholder 骨架与旧订单入口）

**Interfaces:**
- Consumes: Task 1 的 `RoutePath` 新常量；Task 2 的 6 个 mock 常量；Task 3-7 的 5 个组件；`useUserStore`（`@/stores/user`，含 `isLoggedIn` / `userInfo.nickname` / `logout()`）；`navigate`（`@/utils/navigate`）；`useMessage`（`wot-design-uni` 根导出，`confirm` 返回 `Promise<{ action: "confirm" | "cancel" | "modal" }>`）
- Produces: 完整的「我的」页，后续无任务依赖

- [ ] **Step 1: 整文件重写 src/pages/mine/index.vue**

```vue
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
```

- [ ] **Step 2: 验证**

Run: `pnpm type-check && pnpm lint && pnpm lint:style`
Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add src/pages/mine/index.vue
git commit -m "feat(user): 个人中心页按新设计稿重写"
```

---

### Task 9: 全量验证与人工核对

**Files:**
- 无新增文件；本轮仅验证与修复

- [ ] **Step 1: 类型检查与规范检查**

Run: `pnpm type-check && pnpm lint && pnpm lint:style`
Expected: 全部通过；若有报错，修复后重跑直到通过

- [ ] **Step 2: 生产构建验证 pages.json 与分包**

Run: `pnpm build:mp-weixin`
Expected: 构建成功，无 pages.json 解析错误、无分包路径报错

- [ ] **Step 3: 微信开发者工具人工核对清单**

打开 `dist/dev/mp-weixin`（`pnpm dev:mp-weixin`）逐项核对：

1. 已登录：会员卡显示 `Hi,{昵称}`、进度条 30%、Lock待解锁0/1、L3 挑战赛行、统计 0/0/0
2. 未登录（清 storage 或退出登录后）：显示「Hi，请登录」、统计显示「—」、积分显示「—」、无退出登录按钮
3. 未登录点击任意入口 → 跳登录页，登录后回跳原目标页
4. 导航：咨询/预约→预约Tab；待预约→我的预约；会员卡/Lock/去报名→会员中心；全部订单→订单列表；礼品卡→礼品卡占位页；钱包→我的钱包；积分→我的积分；邀请有礼两处→分享中心；病历签署/悦己圈/核销有礼→对应占位页；关于我们→品牌背书；设置→设置；更多/扫码/社群二维码长按/立即进群→「敬请期待」toast
5. 退出登录：弹确认框，取消无副作用，确认后回到未登录态并 toast
6. 视觉：Hero 水泡、会员卡上叠 Hero 40rpx、卡片间距 24rpx、主题绿进度条与浅绿面板、邀请横幅浅玫底 + 橙色角标、5 宫格服务入口单行排布
7. TabBar「我的」高亮正常，页面滚动顺畅

- [ ] **Step 4: 修复人工核对发现的问题并提交**

```bash
git add -A
git commit -m "fix(user): 个人中心页核对问题修复"
```
