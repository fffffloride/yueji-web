import type { BaseQueryParams, PageResult } from "@/api/common";
import { appSettings } from "@/settings";
import { onScopeDispose, readonly, ref, type Ref } from "vue";

export interface UseLoadMoreOptions<T, P> {
  /** 分页请求方法。 */
  fetcher: (params: P & BaseQueryParams) => Promise<PageResult<T>>;
  /** 除分页外的查询条件，响应式对象会在刷新时重新取值。 */
  params?: () => P;
  pageSize?: number;
  /** 是否在调用时立即加载首页数据。 */
  immediate?: boolean;
}

/**
 * 分页列表加载，配合 onReachBottom / onPullDownRefresh 使用。
 *
 * @param options - 配置项。
 * @returns 列表数据与加载状态、刷新与加载更多方法。
 */
export function useLoadMore<T, P extends object = object>(options: UseLoadMoreOptions<T, P>) {
  const { fetcher, params, pageSize = appSettings.pageSize, immediate = true } = options;

  const list = ref<T[]>([]) as Ref<T[]>;
  const total = ref(0);
  const pageNum = ref(1);
  const isLoading = ref(false);
  const isFinished = ref(false);
  const error = ref("");
  let sequence = 0;

  async function load(reset = false) {
    if (!reset && isLoading.value) return;
    if (!reset && isFinished.value) return;

    const current = reset ? ++sequence : sequence;
    isLoading.value = true;
    error.value = "";
    if (reset) {
      list.value = [];
      total.value = 0;
      pageNum.value = 1;
      isFinished.value = false;
    }

    const requestedPage = pageNum.value;
    try {
      const result = await fetcher({
        ...((params?.() ?? {}) as P),
        pageNum: requestedPage,
        pageSize,
      });
      if (current !== sequence) return;
      list.value = reset ? result.list : [...list.value, ...result.list];
      total.value = result.total;
      isFinished.value = list.value.length >= result.total;
      pageNum.value = requestedPage + 1;
    } catch (cause) {
      if (current !== sequence) return;
      error.value = cause instanceof Error ? cause.message : "加载失败，请重试";
      throw cause;
    } finally {
      if (current === sequence) isLoading.value = false;
    }
  }

  async function refresh() {
    await load(true);
  }

  async function loadMore() {
    await load(false);
  }

  if (immediate) void refresh().catch(() => {});
  onScopeDispose(() => {
    sequence++;
  });

  return {
    list,
    total: readonly(total),
    isLoading: readonly(isLoading),
    isFinished: readonly(isFinished),
    error: readonly(error),
    refresh,
    loadMore,
  };
}
