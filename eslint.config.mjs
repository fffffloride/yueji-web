import { existsSync, readFileSync } from "node:fs";
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import pluginVue from "eslint-plugin-vue";
import tseslint from "typescript-eslint";

// unplugin-auto-import 在构建时生成，首次 clone 后可能还不存在
const AUTO_IMPORT_FILE = "./.eslintrc-auto-import.json";
const autoImportGlobals = existsSync(AUTO_IMPORT_FILE)
  ? JSON.parse(readFileSync(AUTO_IMPORT_FILE, "utf8")).globals
  : {};

const uniGlobals = {
  uni: "readonly",
  wx: "readonly",
  plus: "readonly",
  getApp: "readonly",
  getCurrentPages: "readonly",
  UniApp: "readonly",
  UniHelper: "readonly",
  AnyObject: "readonly",
};

export default tseslint.config(
  {
    ignores: ["dist", "node_modules", "src/types/auto-imports.d.ts", ".husky"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  {
    files: ["**/*.{ts,vue}"],
    languageOptions: {
      globals: { ...autoImportGlobals, ...uniGlobals },
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      // 页面文件统一叫 index.vue，无法满足多单词组件名的要求
      "vue/multi-word-component-names": "off",
      "vue/block-order": ["error", { order: ["template", "script", "style"] }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    // 类型声明里用空接口扩展第三方模块是常规写法
    files: ["**/*.d.ts"],
    rules: { "@typescript-eslint/no-empty-object-type": "off" },
  },
  prettier
);
