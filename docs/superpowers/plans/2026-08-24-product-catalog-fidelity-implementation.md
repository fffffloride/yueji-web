# 商品分类列表高保真校准批实施计划

日期：2026-08-24  
依据：[截图高保真还原设计](../specs/2026-08-24-screenshot-fidelity-workflow-design.md)

## 目标

将商品 Tab 改为参考截图中的连续分类目录：左侧一级菜单、右侧二级横向菜单和内容分区双向滚动联动；保留真实“疼痛友好”筛选，并使用悦己现有主题色和真实商品数据。

本批只处理商品分类列表校准。商品详情、购物车和订单属于下一批，不在本计划中提前实现。

## 交付顺序

1. 后端：商品字段、目录接口、SQL 和测试。
2. 管理端：疼痛友好配置与展示。
3. 小程序：目录 API、滚动计算自检、页面和卡片。
4. 联调：真实数据、双尺寸构建和截图对比。

三个仓库分别提交，避免把跨仓库变更揉成不可回退的一次交付。

## 任务 1：后端商品字段与数据库脚本

仓库：`/Users/floride/Work/yueji/yueji-backend`

修改文件：

- `sql/mysql/biz_p0.sql`
- `sql/mysql/biz_test_seed.sql`
- 新建 `sql/mysql/biz_product_catalog.sql`
- `src/product/entities/product.entity.ts`
- `src/product/dto/product-form.dto.ts`
- `src/product/product.service.ts`

步骤：

1. 在 `product` 表增加 `pain_friendly tinyint(1) NOT NULL DEFAULT 0`。
2. `biz_p0.sql` 同步完整建表结构；`biz_product_catalog.sql` 只放现有环境可执行的 `ALTER TABLE`。
3. 测试种子给部分商品写入 `pain_friendly=1`，保证筛选联调有结果和无结果两类数据。
4. `Product` 实体增加 `painFriendly: boolean`。
5. `ProductFormDto` 增加可选布尔字段并使用 `@IsBoolean()`，默认 `false`。
6. `formToEntityFields()` 持久化 `painFriendly`；现有分页、表单详情和 VO 通过实体展开自然返回该字段，不增加重复映射层。

检查：

```bash
pnpm test -- product.service.spec.ts --runInBand
pnpm build
```

## 任务 2：后端连续目录接口

仓库：`/Users/floride/Work/yueji/yueji-backend`

修改文件：

- `src/product/dto/product-query.dto.ts`
- `src/product/app/product-app.controller.ts`
- `src/product/product.service.ts`
- `src/product/product.service.spec.ts`

步骤：

1. 新增 `AppProductCatalogQueryDto`，只接受可选布尔参数 `painFriendly`。
2. 在参数转换中明确接受查询串 `true/false`，非法值交给验证器拒绝，不把任意非空字符串当成 `true`。
3. 在 `ProductAppController` 增加 `GET /app/product/catalog`，放在 `:id` 路由之前。
4. 在 `ProductService` 增加 `appCatalog(query)`：
   - 获取启用分类树。
   - 一次查询全部上架、未删除商品；筛选开启时增加 `painFriendly=true`。
   - 商品按 `sort ASC, sales DESC`。
   - 一级分类成为 `groups`。
   - 一级分类有子节点时，每个直接子节点成为一个 section，并聚合其全部后代商品。
   - 一级分类存在直接挂载商品时，在最前面增加一个与一级分类同名的 section，避免商品丢失。
   - 一级分类无子节点时，生成一个同名 section。
   - 删除空 section 和空 group。
   - section 的 `total` 使用筛选后的实际商品数。
5. 目录卡片返回 `id/name/subTitle/mainImage/tags/price/originalPrice/sales/painFriendly`；不返回详情与 SKU。
6. 在现有 `product.service.spec.ts` 增加一个目录测试，覆盖：
   - 三级分类商品归入直接二级祖先。
   - 一级直接商品不会丢失。
   - 空分类被过滤。
   - 疼痛友好筛选传给数据库查询。
   - 卡片标签由逗号字符串转为数组。

检查：

```bash
pnpm test -- product.service.spec.ts --runInBand
pnpm build
```

完成后提交后端：

```bash
git add sql/mysql/biz_p0.sql sql/mysql/biz_test_seed.sql sql/mysql/biz_product_catalog.sql \
  src/product/entities/product.entity.ts src/product/dto/product-form.dto.ts \
  src/product/dto/product-query.dto.ts src/product/app/product-app.controller.ts \
  src/product/product.service.ts src/product/product.service.spec.ts
git commit -m "feat: add app product catalog"
```

## 任务 3：管理端配置疼痛友好商品

仓库：`/Users/floride/Work/yueji/yueji-oss`

修改文件：

- `src/api/product/types.ts`
- `src/views/product/goods/index.vue`

步骤：

1. `ProductItem` 和 `ProductForm` 增加 `painFriendly?: boolean`。
2. 商品表格增加窄列“疼痛友好”，用只读 Tag 展示“是/否”；不新增单独的快速更新接口。
3. 商品抽屉增加 `el-switch`，标签为“疼痛友好”。
4. 新增商品默认关闭。
5. 编辑时回填布尔值，提交 payload 时原样传给后端。
6. `closeDrawer()` 复用现有重置流程，确认关闭后不会把上一个商品的开关带到下一个商品。

检查：

```bash
pnpm type-check
pnpm build
```

完成后提交管理端：

```bash
git add src/api/product/types.ts src/views/product/goods/index.vue
git commit -m "feat: configure pain-friendly products"
```

## 任务 4：小程序目录类型与 API

仓库：`/Users/floride/Work/yueji/yueji-web`

修改文件：

- `src/api/product/types.ts`
- `src/api/product/index.ts`

步骤：

1. `ProductItem` 补齐现有后端已经返回但前端丢弃的 `subTitle`，并增加 `painFriendly`。
2. 增加 `ProductCatalogSection`、`ProductCatalogGroup` 和 `ProductCatalog` 类型。
3. 扩展 `ServerProductCard` 与 `toProductItem()`，保证分页列表、搜索、详情和目录共用同一个卡片映射。
4. 新增 `ProductAPI.getCatalog(painFriendly)` 请求 `/app/product/catalog`。
5. 保留现有 `getCategories()` 和 `getPage()`，供搜索页和普通商品列表继续使用。

检查：

```bash
pnpm type-check
```

## 任务 5：滚动锚点纯函数与最小自检

仓库：`/Users/floride/Work/yueji/yueji-web`

新建/修改文件：

- 新建 `src/utils/catalog-scroll.ts`
- 新建 `scripts/catalog-scroll-check.ts`
- `package.json`

步骤：

1. 在 `catalog-scroll.ts` 实现一个纯函数：输入有序锚点与当前有效滚动位置，返回最后一个 `top <= position` 的锚点 ID；空数组返回空字符串，首个锚点之前返回首项。
2. 不在纯函数中访问 DOM、Vue 或 uni-app，页面只负责采集锚点。
3. 用 Node 内置 `assert` 编写四个自检：空锚点、首项之前、中间切换、末项之后。
4. `package.json` 增加 `check:catalog-scroll`，使用当前 Node 的 TypeScript strip-types 能力直接运行脚本，不添加测试依赖。

检查：

```bash
pnpm check:catalog-scroll
pnpm type-check
```

## 任务 6：商品卡片适配参考视觉

仓库：`/Users/floride/Work/yueji/yueji-web`

修改文件：

- `src/components/YjProductCard.vue`

步骤：

1. 保留组件现有 `product` 入参和点击详情行为，不新建第二套商品卡片。
2. 增加副标题单行截断。
3. 疼痛友好商品显示墨绿语义标签；普通业务标签继续使用现有 Tag。
4. 显示销量、现价和 `originalPrice - price` 的优惠金额；差额小于等于零时不显示优惠。
5. 图片使用固定比例、`aspectFill` 和失败占位，避免加载状态改变卡片高度。
6. 按参考图收紧圆角、留白和文字层级，同时在独立搜索/列表页检查没有布局回归。

检查：

```bash
pnpm type-check
```

## 任务 7：重写商品 Tab 为连续目录

仓库：`/Users/floride/Work/yueji/yueji-web`

修改文件：

- `src/pages/product/index.vue`

步骤：

1. 保留 `YjPage` 和当前自定义 TabBar，主区域改为参考图的左右两栏。
2. 左栏沿用 `176rpx`，使用独立纵向 `scroll-view`。
3. 右栏使用单个纵向 `scroll-view`，顺序渲染所有 group 与 section。
4. 顶部加入 `wd-switch` 疼痛友好筛选；当前目录在请求期间保留，避免闪空。
5. 当前 group 有多个 section 时显示横向二级菜单；菜单吸附在右栏顶部，并使用 `scroll-into-view` 让高亮项可见。
6. 给一级和二级标题生成稳定 DOM ID。数据渲染及图片固定尺寸就绪后，用 `uni.createSelectorQuery()` 测量相对右侧滚动容器的锚点。
7. 右侧 `@scroll` 调用纯函数计算当前一级和二级分区，更新两个高亮和菜单可见位置。
8. 点击菜单时：
   - 先设置目标高亮。
   - 用右侧 `scroll-into-view` 定位标题。
   - 在到达目标容差范围后解除程序滚动锁。
   - 超时仍未到达时解除锁并按实际滚动位置重新计算，避免永久失去联动。
9. 筛选成功后重测锚点；当前分区已消失则回到第一个 group。
10. 筛选失败时恢复开关并保留旧目录；首次失败显示页面内重试；无数据使用 `YjEmpty`。
11. 移除商品 Tab 当前搜索框和排序栏；独立搜索页及普通商品列表路由不变。

检查：

```bash
pnpm check:catalog-scroll
pnpm type-check
pnpm build:mp-weixin
```

## 任务 8：真实数据联调与视觉验收

前置材料：

- 用户补一张“仅查看疼痛友好项目”开启后的截图。
- 用户补一张参考列表底部截图。

步骤：

1. 对现有数据库执行 `biz_product_catalog.sql`。
2. 在管理端至少配置：
   - 两个疼痛友好商品。
   - 一个筛选后为空的分类。
   - 一个长名称、多标签、存在原价差额的商品。
3. 验证目录接口关闭/开启筛选时的分组、数量和商品集合。
4. 在微信开发者工具分别使用 375px 和 430px 逻辑宽度验证：
   - 点击一级菜单定位并高亮。
   - 手动滚动反向更新一级高亮。
   - 点击二级菜单定位并高亮。
   - 手动滚动反向更新二级高亮，横向菜单自动保持可见。
   - 快速连续点击菜单不闪烁、不锁死。
   - 筛选成功、失败、无结果均保持正确布局。
   - 图片失败不改变锚点。
5. 在 750rpx 基准下截实现图，与两张现有参考图以及两张补充图并排/叠加校准；关键布局误差控制在约 4rpx。
6. 复查搜索页与普通商品列表页，确认共享卡片改动没有回归。

最终检查：

```bash
# yueji-backend
pnpm test -- product.service.spec.ts --runInBand
pnpm build

# yueji-oss
pnpm type-check
pnpm build

# yueji-web
pnpm check:catalog-scroll
pnpm type-check
pnpm build:mp-weixin
```

完成后提交小程序：

```bash
git add package.json scripts/catalog-scroll-check.ts src/api/product/index.ts src/api/product/types.ts \
  src/components/YjProductCard.vue src/pages/product/index.vue src/utils/catalog-scroll.ts
git commit -m "feat: rebuild product catalog browsing"
```

## 完成定义

- 后端、管理端和小程序三个提交均可独立回退。
- 商品目录只使用真实接口和真实配置。
- 疼痛友好筛选不是静态 UI。
- 一级、二级菜单的点击与滚动联动通过真机或微信开发者工具验收。
- 参考图与实现图完成对比并由用户确认。
- 下一批才进入商品详情、购物车和订单。
