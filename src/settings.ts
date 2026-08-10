import type { ConfigProviderThemeVars } from "wot-design-uni";

/** 应用级配置。 */
export const appSettings = {
  title: import.meta.env.VITE_APP_TITLE,
  /** 接口请求超时时间（毫秒）。 */
  requestTimeout: 15000,
  /** 分页默认每页条数。 */
  pageSize: 10,
} as const;

/**
 * wot-design-uni 主题变量。
 *
 * 全局样式已在 styles/common.scss 里覆盖了同名 CSS 变量，
 * 这里主要供需要局部换肤（如活动页、深色模式）的页面包 wd-config-provider 使用。
 */
export const themeVars: ConfigProviderThemeVars = {
  colorTheme: "#2D5A3D",
  colorSuccess: "#52C41A",
  colorWarning: "#FAAD14",
  colorDanger: "#FF4D4F",
  colorTitle: "#1A1A1A",
  colorContent: "#333333",
  colorSecondary: "#666666",
  colorAid: "#999999",
  colorTip: "#CCCCCC",
  colorBorder: "#E5E5E5",
  colorBorderLight: "#EEEEEE",
  colorBg: "#F7F8FA",
  sizeSidePadding: "30rpx",
};
