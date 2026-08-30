# 悦己 DLumière 小程序 — AI / 新对话入口

## 必读

- 先读 [docs/改造计划.md](docs/改造计划.md)。
- 收到参考 UI 截图，或用户要求“按截图还原页面”“模仿 UI”“继续下一个页面/模块”时，必须读取并执行 [yueji-ui-from-screenshot](.agents/skills/yueji-ui-from-screenshot/SKILL.md)。

## 工作区约定

三个仓库放在同一父目录，禁止在文档、计划或代码中写本机绝对路径：

- 当前小程序：本仓库
- 服务端：`../yueji-backend`
- 管理端：`../yueji-oss`

当前：阶段 2 产品中心已实现；服务端和管理端阶段 3–7、8A–8E 已完成，C 端接口可用。小程序阶段 3–8 恢复时按 `docs/改造计划.md` 接真实接口。
