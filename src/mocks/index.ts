export type MockContext = {
  data?: unknown;
  params?: object;
};

export type MockHandler = (ctx: MockContext) => unknown | Promise<unknown>;

/**
 * mock 数据注册表，键为 `METHOD 接口路径`（路径不含 baseURL 与 /api/v1 前缀）。
 *
 * 仅在 VITE_USE_MOCK=true 时生效，未注册的接口会照常走真实请求，
 * 便于后端接口逐个联调时按需摘除。
 */
export const mockRegistry: Record<string, MockHandler> = {
  // 示例：
  // "GET /product/list": () => ({ list: [], total: 0 }),
};

/**
 * 查找匹配的 mock 处理器。
 *
 * @param method - 请求方法。
 * @param url - 接口路径，需与注册表键中的路径一致。
 * @returns 命中的处理器，未命中返回 undefined。
 */
export function findMock(method: string, url: string): MockHandler | undefined {
  return mockRegistry[`${method.toUpperCase()} ${url}`];
}
