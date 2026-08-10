/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface ImportMetaEnv {
  /** 应用名称。 */
  readonly VITE_APP_TITLE: string;
  /** 接口域名，不含路径前缀。 */
  readonly VITE_API_BASE_URL: string;
  /** 接口统一前缀，如 /api/v1。 */
  readonly VITE_API_PREFIX: string;
  /** 是否启用本地 mock 数据，取值 "true" / "false"。 */
  readonly VITE_USE_MOCK: string;
  /** 是否输出调试日志，取值 "true" / "false"。 */
  readonly VITE_DEBUG: string;
  /** H5 开发服务端口。 */
  readonly VITE_PORT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
