# 个人中心页（我的）设计文档

- 日期：2026-08-30
- 设计稿：蓝湖更新后的个人中心设计，以 Figma Make「小程序UI还原」文件为参考
  （fileKey `wl6p29kuR4uIm8frGFOjlb`，`MyPage` 节点）
- 目标页面：`src/pages/mine/index.vue`（TabBar「我的」）

## 1. 背景与目标

当前个人中心页是脚手架阶段的 `YjPlaceholder` 骨架（需求文档 3.6 节）。蓝湖更新了个人中心设计，
结构较旧需求 3.6 变化较大（新增会员卡、邀请有礼、服务图标宫格、社群二维码、专属服务群；
旧需求中的订单状态横栏、会员中心入口、拼团/抽奖、代理商分享中心、收藏/优惠券/消息/地址等不再出现）。
本次按新设计稿重写该页面。

## 2. 已确认的设计决策

1. **品牌适配**：设计稿为新氧（SOYOUNG）品牌还原稿。保留布局结构，品牌名/logo/配色换成悦己：
   SOYOUNG → 悦己DLumière，主绿 `#7BC142` → 主题绿 `$color-primary #2d5a3d`，文案按悦己语境改写。
2. **完全按新设计实现**，旧需求 3.6 的入口不再保留；无路由的入口新建 YjPlaceholder 占位页。
3. **Mock 数据 + 登录态区分**：新增 `src/mocks/mine.ts`；未登录时会员卡区显示「请登录」引导，
   数据归零/显示「—」；点击入口走 `handleEntryClick`（`requireAuth: true`）。
4. **按区块拆 Yj\* 组件**，与首页组件化风格一致。

## 3. 页面结构与组件拆分

```
<YjPage :tabbar="RoutePath.MINE" :padded="false">
  YjMineMemberCard          ← Hero + 会员卡
  YjQuickEntry（复用）       ← 快捷工具：全部订单 / 礼品卡 / 钱包 / 积分
  YjInviteCard              ← 邀请有礼
  YjMineServiceGrid         ← 服务图标宫格
  YjCommunityCard           ← 社群二维码卡
  YjServiceGroupCard        ← 专属服务群
  退出登录按钮（页面级 BEM 块 mine-logout）
</YjPage>
```

### 新建组件（`src/components/`，easycom 自动解析）

| 组件 | 内容 | 数据 |
|---|---|---|
| `YjMineMemberCard.vue` | 浅灰渐变 + 水泡装饰 Hero（高 280rpx）；顶部导航：左「咨询/预约」胶囊、右「···」+「扫码」圆形按钮（复用首页同款交互，点击扫码/更多弹敬请期待 toast）；白卡上叠：昵称 `Hi,xxx` / `welcome back`、会员进度条（悦己DLumière MEMBER + 进度 + Lock待解锁 n/1 + 去解锁）、L3 挑战赛行 + 去报名按钮、底部三统计：待预约/待到店/服务记录 | props + `userStore` 昵称 |
| `YjInviteCard.vue` | 标题「邀请有礼」+「了解详情」；浅玫色横幅「送您 3000 元现金！」+ 参与人数角标 + 底部主题色细条；三列奖励（无门槛优惠券/现金奖励/积分奖励）+ 立即邀请按钮 | props + mocks |
| `YjMineServiceGrid.vue` | 5 宫格：病历签署 / 悦己圈 / 核销有礼 / 关于我们 / 设置 | mocks |
| `YjCommunityCard.vue` | 「长按加入悦己同好社群」+ 副文案 + 128×128rpx 二维码位（qrcode 图标占位） | mocks |
| `YjServiceGroupCard.vue` | 「悦己专属服务群」标题 + 主题绿浅底面板：群介绍 + 立即进群按钮 + 2×2 权益列表（真实案例对比 / 7x24小时智能服务 / 术后护理指南 / 生日礼·核销礼·专属优惠券） | mocks |

### 复用

- `YjQuickEntry`：icon/value + label 宫格，API 已匹配快捷工具区（积分项用 value 显示数值）。
- `YjPage`：`:tabbar` 定制 TabBar；`:padded="false"`（Hero 需要通栏）。

## 4. 数据模型（`src/mocks/mine.ts`）

沿用首页 mock 模式（接口 + 静态数据，金额为整数分，`formatPrice` 展示）：

```ts
export interface MemberInfo {
  nickname: string;          // 未登录显示「请登录」
  levelName: string;         // 如「悦己DLumière MEMBER」
  progress: number;          // 0-100
  lockedCount: number;       // Lock待解锁 n/1
  challengeText: string;     // L3 挑战赛文案
  challengeGift: number;     // 赠送价值（分）
}

export interface QuickTool { label: string; value?: string; icon?: string; }
export interface InviteStat { label: string; amount: number; }
export interface InviteInfo {
  title: string; participants: number;
  stats: InviteStat[];       // 无门槛优惠券 / 现金奖励 / 积分奖励
}
export interface ServiceEntry { label: string; icon: string; }
export interface ServiceGroup {
  title: string; desc: string; joinText: string; benefits: string[];
}
```

## 5. 登录态行为

- `userStore.isLoggedIn`：未登录时昵称区显示「Hi，请登录」、统计与积分显示「—」/0；
  点击任意入口先走登录（`handleEntryClick` → `navigate(path, { requireAuth: true })`）。
- 退出登录：`userStore.logout()`，前置 `wd-message-box` 二次确认；未登录时隐藏退出登录按钮。

## 6. 导航映射

| 设计入口 | 目标 | 说明 |
|---|---|---|
| 咨询/预约 | `RoutePath.APPOINTMENT` | TabBar，switchTab |
| 待预约 | `MY_APPOINTMENT` | 待到店/服务记录照设计稿无跳转 |
| 会员卡区 / Lock去解锁 / L3 去报名 | `USER_MEMBER` | 会员中心已有页面 |
| 全部订单 | `ORDER_LIST` | |
| 礼品卡 | `USER_GIFT_CARD` | **新建占位页** |
| 钱包 | `USER_WALLET` | |
| 积分 | `USER_POINTS` | |
| 邀请有礼（了解详情/立即邀请） | `DISTRIBUTION` | `requireAuth: true`（分销中心已有） |
| 病历签署 | `USER_MEDICAL_RECORD` | **新建占位页** |
| 悦己圈 | `USER_COMMUNITY` | **新建占位页**（原「氧分呐」，悦己语境改名） |
| 核销有礼 | `USER_VERIFY_GIFT` | **新建占位页** |
| 关于我们 | `BRAND` | 品牌背书已有页面 |
| 设置 | `USER_SETTINGS` | |
| 退出登录 | — | `userStore.logout()` |

### 新增路由与占位页

- `src/constants/routes.ts` 增加：`USER_GIFT_CARD`、`USER_MEDICAL_RECORD`、`USER_COMMUNITY`、`USER_VERIFY_GIFT`
- `src/pages.json` 的 `pages-sub/user` 分包注册 4 个页面（`gift-card` / `medical-record` / `community` / `verify-gift`）
- 4 个占位页统一 `YjPage` + `YjPlaceholder` 骨架（含对应需求要点），后续逐个实现

## 7. 样式适配

- **颜色映射**（一律引用 `variables.scss` 变量或 `--yj-*` 自定义属性，不硬编码）：
  | 设计稿 | 悦己 |
  |---|---|
  | 主绿 `#7BC142` / `DARK #1a1a1a` 按钮 | `$color-primary` / `$color-text-title` |
  | 进度条渐变 `#9fd46a → #7BC142` | `$color-primary-lighter → $color-primary` |
  | 浅绿底 `#e8f5e0` | `$color-primary-tint`（已有） |
  | 浅玫横幅 `#fce4ec` | `$color-surface-rose`（已有） |
  | 角标橙 `#FF6B35` | `$color-price`（已有） |
  | 页面灰底 `#e8eaec` | `$color-bg-page` |
- **设计稿 px → rpx**（750 基准，8rpx 网格）：140px Hero ≈ 280rpx，卡片圆角 16px ≈ 32rpx 等。
- **图标映射**（wd-icon 字体图标，已核对名称存在）：
  | 设计 | wd-icon |
  |---|---|
  | 咨询/预约 | `chat` |
  | 更多/扫码 | `ellipsis` / `scan` |
  | 全部订单 | `list` |
  | 礼品卡 | `creditcard` |
  | 钱包 | `wallet` |
  | 病历签署 | `file` |
  | 悦己圈 | `info-circle` |
  | 核销有礼 | `gift` |
  | 关于我们 | `help-circle` |
  | 设置 | `setting` |
  | 权益勾 | `check` |
  | 解锁/箭头 | `lock-off` / `chevron-right` |
  | 社群二维码位 | `qrcode` |
- **文案改写**（悦己语境）：SOYOUNG CLINIC MEMBER → 悦己DLumière MEMBER；新氧青春专属服务群 → 悦己专属服务群；
  百万智美女性社群 → 悦己同好社群；氧分呐 → 悦己圈；welcome back / Hi 保留英文辅助文案。

## 8. 错误处理与边界

- 所有入口点击统一 `handleEntryClick`（`requireAuth: true`，部分加 `requireAgent` 不适用本页）。
- 未登录点击：走登录流程，不弹错误。
- 退出登录：`wd-message-box` 确认，取消无副作用；确认后 `logout()` 并提示。
- 二维码、横幅图：还原阶段用图标/纯色占位（`qrcode` 图标 + 浅色块），后续接真实图片资源。
- mock 数据全部只读，不落 storage。

## 9. 测试与验证

项目未配置单测框架，验证方式：

1. `pnpm type-check` 通过（vue-tsc）
2. `pnpm lint` + `pnpm lint:style` 通过
3. `pnpm dev:mp-weixin` 在微信开发者工具中人工核对：
   - 已登录 / 未登录两种状态
   - 每个入口跳转正确（有路由的到页，占位页显示 YjPlaceholder）
   - TabBar 切换、返回不丢状态
   - 退出登录二次确认流程

## 10. 范围外（本次不做）

- 会员进度条、L3 挑战赛、邀请有礼的真实接口对接（等后端接口）
- 病历签署 / 悦己圈 / 核销有礼 / 礼品卡 4 个占位页的业务实现
- 社群二维码真实图片、横幅真实图片资源
- 代理商相关入口（分享中心在新设计稿中已移除）
