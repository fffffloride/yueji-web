# 悦己 DLumière 微信小程序

面向医美行业的微信小程序，提供商品展示、在线预约、会员体系、积分商城、二级分销等能力。

当前仓库处于**脚手架阶段**：工程配置、主题体系、请求与登录封装、全量路由与页面骨架已就绪，业务页面内容待逐个实现。每个页面里的 `YjPlaceholder` 标注了它对应的需求条目，页面开始实现后删除即可。

> 需求文档 5.2 原本约定「微信小程序原生 + Vant Weapp」，本项目改用 **uni-app + Vue 3 + TypeScript**，UI 库用 **wot-design-uni** 替代 Vant Weapp。

## 技术栈

| 分类 | 选型 |
| --- | --- |
| 框架 | uni-app（Vue 3 + Vite 5 + TypeScript） |
| UI | wot-design-uni（easycom 自动引入） |
| 样式 | SCSS（BEM）+ UnoCSS（unocss-applet） |
| 状态 | Pinia + pinia-plugin-persistedstate |
| 规范 | ESLint 9 + Prettier + Stylelint + husky + commitlint |

## 环境要求

Node.js >= 18，pnpm >= 9。

## 快速开始

```bash
pnpm install
pnpm dev:mp-weixin
```

然后打开微信开发者工具，导入 `dist/dev/mp-weixin` 目录。

生产构建：

```bash
pnpm build:mp-weixin   # 产物在 dist/build/mp-weixin
```

其他命令：

```bash
pnpm type-check   # vue-tsc 类型检查
pnpm lint         # ESLint 检查并修复
pnpm lint:style   # Stylelint 检查并修复
```

## 上线前必须补齐的配置

| 位置 | 说明 |
| --- | --- |
| `src/manifest.json` 的 `mp-weixin.appid` | 微信小程序 AppID，真机预览与发布必填 |
| `.env.production` 的 `VITE_API_BASE_URL` | 生产接口域名，当前是占位值 |
| `.env.development` 的 `VITE_USE_MOCK` | 后端接口就绪后改为 `false` |

## 目录结构

```
src/
├── api/            # 接口层，按模块划分（index.ts + types.ts）
│   ├── common.ts   # ApiResult / PageResult / BaseQueryParams / OptionItem
│   └── user/ product/ order/ pay/
├── components/     # 全局组件，Yj 前缀，easycom 自动引入
├── composables/    # 组合式函数，自动导入
├── constants/      # 路由路径、缓存键名
├── enums/          # 订单、会员、医生、优惠券枚举
├── mocks/          # 本地 mock 注册表
├── pages/          # 主包：5 个 TabBar 页 + 登录页
├── pages-sub/      # 分包：product / order / appointment / user / marketing / distribution / common
├── stores/         # Pinia，扁平结构，自动导入
├── styles/         # variables / mixins / common
├── utils/          # request / auth / navigate / storage / format
└── settings.ts     # 应用配置与 wot 主题变量
```

## 关键约定

### 页面容器

业务页统一用 `YjPage` 包裹，它负责页面留白、底部固定栏占位与自定义 TabBar：

```vue
<template>
  <YjPage :tabbar="RoutePath.HOME" has-footer>
    <!-- 页面内容 -->
    <template #footer>
      <!-- 底部固定操作栏 -->
    </template>
  </YjPage>
</template>
```

### TabBar

`pages.json` 里声明了原生 tabBar，但只是为了让 `uni.switchTab` 可用；视觉上由 `YjTabBar` 接管，组件挂载时会调用 `uni.hideTabBar()`。等设计切图到位后，把图标配进 `pages.json` 并移除 `YjTabBar` 即可切回原生。

### 路由跳转

不要直接写路径字符串，统一走 `RoutePath` + `navigate()`，它会自动区分 TabBar 页、校验登录态与代理商身份：

```ts
import { RoutePath } from "@/constants";
import { navigate } from "@/utils/navigate";

navigate(RoutePath.PRODUCT_DETAIL, { params: { id } });
navigate(RoutePath.DISTRIBUTION, { requireAuth: true, requireAgent: true });
```

### 接口调用

接口按模块组织成对象字面量，`request` 成功时直接返回后端 `data`，失败抛错并已统一 toast：

```ts
const ProductAPI = {
  getPage(params: ProductQueryParams) {
    return request<PageResult<ProductItem>>({ url: "/product/list", params });
  },
};
```

类型命名用语义后缀（`XxxItem` / `XxxForm` / `XxxDetail` / `XxxQueryParams`），不使用 `VO` / `DTO`。

### 金额与单位

金额一律用整数「分」传输与存储，展示时经 `formatPrice` 转换。设计稿基于 750 宽，样式统一用 `rpx`；UnoCSS 已配置 rem→rpx，`p-1` 等于 8rpx，正好对齐设计规范的 8rpx 基准网格。

### 样式边界

- 有结构语义的元素用 BEM + SCSS，Block 带页面前缀（如 `mine-orders__item`）
- 无语义的布局微调用 UnoCSS，同一元素原子类不超过 3 个
- 颜色用 `variables.scss` 里的变量或 `--yj-*` CSS 变量，禁止硬编码

### 主题

品牌墨绿主题通过覆盖 `--wot-*` CSS 变量全局生效（见 `src/styles/common.scss`），无需在每个页面包 `wd-config-provider`。需要局部换肤或深色模式时，用 `settings.ts` 导出的 `themeVars` 配合 `wd-config-provider`。

## 提交规范

遵循 Conventional Commits，提交时 husky 会跑 lint-staged 与 commitlint：

```
feat(product): 商品详情页规格选择
fix(order): 修复优惠券金额计算错误
```

可用类型：`feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert`。
