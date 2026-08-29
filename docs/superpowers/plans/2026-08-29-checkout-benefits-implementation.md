# 确认订单优惠券与积分抵扣实施计划

日期：2026-08-29  
依据：`docs/superpowers/specs/2026-08-29-checkout-benefits-design.md`

## 1. 补齐订单权益接口

- 在 `src/api/order/types.ts` 增加可用优惠券类型。
- 在 `src/api/order/index.ts` 接入 `POST /app/order/available-coupons`。
- 扩展现有结算自检，覆盖优惠券 ID 与积分参数的归一化。

## 2. 改造确认订单页

- 增加优惠券入口、底部选择弹层和“不使用优惠券”。
- 增加默认开启的积分抵扣开关；积分为零时显示禁用态。
- 切换权益后调用服务端重新试算，失败时保留上一次成功结果。
- 创建订单提交最后一次试算确认的 `memberCouponId` 与 `pointsUsed`。

## 3. 验收与交付

- 使用真实 Mock 会员数据验证默认最优券、切券、不用券、积分开关和订单金额。
- 在 `375×812`、`430×932` 验证弹层、长券名、空券和固定底栏。
- 运行 `pnpm verify:ui`、`git diff --check`，更新阶段进度并独立提交。
