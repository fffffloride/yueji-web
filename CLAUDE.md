# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

悦己 DLumière — a medical aesthetics (医美) WeChat Mini Program built with **uni-app (Vue 3 + TypeScript + Vite 5)**. Currently in scaffolding phase: engineering setup, theme system, request/auth layer, route definitions, and page skeletons are in place; business page content is pending implementation.

## Essential Commands

```bash
pnpm install              # install dependencies (Node >= 18, pnpm >= 9)
pnpm dev:mp-weixin        # dev server, open dist/dev/mp-weixin in WeChat DevTools
pnpm build:mp-weixin      # production build → dist/build/mp-weixin
pnpm type-check           # vue-tsc type checking (no emit)
pnpm lint                 # ESLint fix
pnpm lint:style           # Stylelint fix
pnpm format               # Prettier format
```

There is also `pnpm dev:h5` / `pnpm build:h5` for the H5 target, but WeChat Mini Program is the primary target.

## Key Architecture Decisions

### Routing: always use `RoutePath` + `navigate()`

Never hardcode URL strings. All routes are defined in `src/constants/routes.ts` as `RoutePath` constants. The `navigate()` utility at `src/utils/navigate.ts` auto-detects TabBar pages (uses `switchTab`) vs regular pages (uses `navigateTo`), and can enforce login/auth/agent guards:

```ts
import { RoutePath } from "@/constants";
import { navigate, goBack, toLogin } from "@/utils/navigate";

navigate(RoutePath.PRODUCT_DETAIL, { params: { id } });
navigate(RoutePath.DISTRIBUTION, { requireAuth: true, requireAgent: true });
```

The main package has 5 TabBar pages + login; subpackages cover product, order, appointment, user, marketing, distribution, and common pages.

### API layer pattern

Each API module lives in `src/api/<domain>/` with two files: `types.ts` (request/response interfaces) and `index.ts` (methods object). The shared `request()` wrapper at `src/utils/request.ts`:

- Prepends `baseURL + /api/v1` automatically
- Injects `Authorization: Bearer <token>` unless `skipAuth: true`
- On business code 401, clears token and redirects to login (with dedup guard)
- Returns `result.data` directly on success; throws `Error` with auto-toast on failure
- When `VITE_USE_MOCK=true` (set in `.env.development`), checks `src/mocks/index.ts` mockRegistry before making real requests
- Success code is 200 (not 0); defined as `BUSINESS_CODE_SUCCESS`

Type naming convention: `XxxItem` / `XxxForm` / `XxxDetail` / `XxxQueryParams` — do NOT use `VO`/`DTO`.

```ts
const ProductAPI = {
  getPage(params: ProductQueryParams) {
    return request<PageResult<ProductItem>>({ url: "/product/list", params });
  },
};
```

`ApiResult<T>` and `PageResult<T>` are defined in `src/api/common.ts`.

### State management (Pinia)

Stores live flat in `src/stores/`. Pinia is configured with `pinia-plugin-persistedstate` backed by `uni.getStorageSync/setStorageSync` (mini programs have no localStorage). Auto-imported, no manual registration needed.

Each store exports both `useXxxStore()` (for components/hooks) and `useXxxStoreHook()` (for use outside component context, e.g., interceptors/utils — it receives the pre-created pinia instance from `src/stores/index.ts`).

Current stores: `app` (system info, city), `user` (login/userInfo/isAgent — persisted), `cart` (items/quantities — persisted).

### Auto-imports (unplugin)

The following are auto-imported and should NOT be manually imported in `.ts`/`.vue` files:
- Vue APIs: `ref`, `computed`, `watch`, `readonly`, etc.
- Pinia: `defineStore`, `storeToRefs`
- uni-app lifecycle: `onLaunch`, `onLoad`, `onShow`, `onHide`, `onReady`, `onUnload`, `onPullDownRefresh`, `onReachBottom`, `onPageScroll`, `onShareAppMessage`, `onShareTimeline`, `onTabItemTap`
- Composables from `src/composables/`: `useLogin`, `useLoadMore`
- Stores from `src/stores/`: `useAppStore`, `useUserStore`, `useCartStore`

### Component registration (easycom)

Components are auto-resolved — no manual imports or `components` declarations:
- `wd-*` → `wot-design-uni/components/wd-*/wd-*.vue`
- `Yj*` → `src/components/Yj*.vue`

### Page container convention

Every business page wraps content in `<YjPage>`, which handles page padding, bottom-bar spacing, and custom TabBar:

```vue
<template>
  <YjPage :tabbar="RoutePath.HOME" has-footer>
    <!-- content -->
    <template #footer><!-- fixed bottom bar --></template>
  </YjPage>
</template>
```

### Theme system

Brand dark-green theme (`#2D5A3D`) is applied globally:
- SCSS variables in `src/styles/variables.scss` (injected into every component via `uni.scss`)
- CSS custom properties (`--yj-*` and `--wot-*`) declared in `src/styles/common.scss`, applied on the `page` element
- `src/settings.ts` exports `themeVars` for `wd-config-provider` when localized theme override is needed
- UnoCSS theme colors (in `uno.config.ts`) match the same palette

### Styling rules

- Semantic/layout structures use **BEM + SCSS**, with page-prefixed block names (e.g., `mine-orders__item`)
- Minor presentational tweaks use **UnoCSS** atomic classes; max 3 atomic classes per element
- Design spec: 750px base, **8rpx grid**. UnoCSS spacing: `p-1` = 8rpx
- Colors must reference `variables.scss` variables or `--yj-*` CSS custom properties; never hardcoded
- Amounts are always integer **cents (分)** on the wire; display via `formatPrice(cents)` from `src/utils/format.ts`

### Storage layer

`src/utils/storage.ts` wraps `uni.*StorageSync` with TTL support. All keys use the `yueji:*` prefix (defined in `src/constants/storage-key.ts`), enabling `clearAppStorage()` to bulk-clear only this app's data.

### Commit conventions

Follow Conventional Commits: `feat(product): ...`, `fix(order): ...`. Valid types: `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert`. Husky runs lint-staged + commitlint on commit.
