import { defineConfig, transformerDirectives, transformerVariantGroup } from "unocss";
import {
  presetApplet,
  presetRemRpx,
  transformerApplet,
  transformerAttributify,
} from "unocss-applet";

/**
 * 小程序端不支持 `[` `:` `%` 等类名字符，因此用 presetApplet 替代 presetUno，
 * 并配合 transformerApplet 在编译期把非法字符替换为合法类名。
 */
export default defineConfig({
  presets: [
    presetApplet(),
    // 默认 baseFontSize 16 + screenWidth 375，即 1 个间距单位 = 8rpx，与设计稿 8rpx 基准网格一致
    presetRemRpx(),
  ],
  transformers: [
    transformerAttributify({ ignoreAttributes: ["block", "size", "type", "shape"] }),
    transformerApplet(),
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  theme: {
    colors: {
      primary: {
        DEFAULT: "#2D5A3D",
        dark: "#1A3A28",
        light: "#4A7C59",
        lighter: "#6B9B7A",
      },
      page: "#F7F8FA",
      title: "#1A1A1A",
      content: "#333333",
      sub: "#666666",
      placeholder: "#999999",
      line: "#EEEEEE",
      success: "#52C41A",
      warning: "#FAAD14",
      danger: "#FF4D4F",
      price: "#FF6B35",
    },
  },
  shortcuts: {
    "flex-center": "flex items-center justify-center",
    "flex-y-center": "flex items-center",
    "flex-between": "flex items-center justify-between",
    "text-ellipsis": "overflow-hidden whitespace-nowrap text-ellipsis",
  },
});
