import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import UniPlugin from "@dcloudio/vite-plugin-uni";
import UnoCSS from "unocss/vite";
import AutoImport from "unplugin-auto-import/vite";

// 配置文件按 ESM 解析（.mts），而 vite-plugin-uni 是 CJS 包，
// 互操作后默认导出可能被包一层，这里做一次兼容取值。
const uni = (UniPlugin as unknown as { default?: typeof UniPlugin }).default ?? UniPlugin;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    plugins: [
      UnoCSS(),
      AutoImport({
        imports: [
          "vue",
          "pinia",
          {
            "@dcloudio/uni-app": [
              "onLaunch",
              "onShow",
              "onHide",
              "onLoad",
              "onReady",
              "onUnload",
              "onPullDownRefresh",
              "onReachBottom",
              "onPageScroll",
              "onShareAppMessage",
              "onShareTimeline",
              "onTabItemTap",
            ],
          },
        ],
        dirs: ["src/composables", "src/stores"],
        dts: "src/types/auto-imports.d.ts",
        vueTemplate: true,
        eslintrc: { enabled: true, filepath: "./.eslintrc-auto-import.json" },
      }),
      uni(),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          // wot-design-uni 内部仍在用 @import 与 nth/unquote 等全局函数，
          // 这些告警来自依赖本身，屏蔽后才能看清项目自身的编译信息
          silenceDeprecations: ["import", "global-builtin", "legacy-js-api"],
        },
      },
    },
    build: {
      // uni-app vue3 需主动开启，便于开发期定位源码
      sourcemap: mode === "development",
    },
    server: {
      port: Number(env.VITE_PORT) || 5173,
    },
  };
});
