# 商品详情与最小交易闭环实施计划

日期：2026-08-29  
依据：`docs/superpowers/specs/2026-08-29-product-detail-checkout-design.md`

## 1. 对齐真实接口

- 新增 `src/api/cart/`，映射服务端购物车列表与增删改接口。
- 修正 `src/api/order/` 为 `/app/order`，补齐试算、创建返回值和两种结算来源类型。
- 修正 `src/api/pay/` 为 `/app/payment`，补齐创建、查询和开发环境 Mock 确认。
- 增加一个最小结算来源解析函数与无框架自检，并纳入 `verify:ui`。

## 2. 接入服务端购物车

- 将 `src/stores/cart.ts` 改为服务端购物车缓存，统一负责读取、加购、改数量、选择和删除。
- 改造 `src/pages/cart/index.vue`，覆盖空态、失效项、选择、数量、删除和去结算。
- 保持 `YjTabBar` 继续读取同一个 Store 的总数量。

## 3. 还原商品详情

- 改造 `src/pages-sub/product/detail/index.vue`：沉浸式媒体、价格带、商品信息、SKU、项目介绍、购买说明和固定底栏。
- `src/pages.json` 仅为商品详情开启自定义导航，保留其他页面导航行为。
- 接通登录回跳、真实加购和立即购买；所有交易动作防重复提交。

## 4. 打通确认订单与支付结果

- 改造 `src/pages-sub/order/confirm/index.vue`，支持 `skuId` 和 `cartIds` 两种来源。
- 页面重新读取真实商品或购物车，调用服务端试算，校验联系人和手机号并创建订单。
- 改造 `src/pages-sub/order/pay-result/index.vue`，按服务端支付状态展示处理中、成功和失败；开发环境提供 Mock 支付。
- 零元订单跳过支付创建，直接展示成功。

## 5. 验收与交付

- 运行新增自检、触及文件 ESLint/Stylelint 和 `pnpm verify:ui`。
- 启动服务端与 H5，在 `375×812`、`430×932` 验证详情、SKU、加购、立即购买、试算、创建订单和 Mock 支付。
- 检查 `git diff --check` 与工作区，只提交本轮代码、计划和进度文档。
