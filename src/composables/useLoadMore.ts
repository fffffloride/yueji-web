import type { BaseQueryParams, PageResult } from "@/api/common";
import { appSettings } from "@/settings";

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

  async function load(reset = false) {
    if (isLoading.value) return;
    if (!reset && isFinished.value) return;

    isLoading.value = true;
    if (reset) {
      pageNum.value = 1;
      isFinished.value = false;
    }

    try {
      const result = await fetcher({
        ...((params?.() ?? {}) as P),
        pageNum: pageNum.value,
        pageSize,
      });
      list.value = reset ? result.list : [...list.value, ...result.list];
      total.value = result.total;
      isFinished.value = list.value.length >= result.total;
      pageNum.value += 1;
    } finally {
      isLoading.value = false;
    }
  }

  async function refresh() {
    await load(true);
  }

  async function loadMore() {
    await load(false);
  }

  if (immediate) refresh();

  return {
    list,
    total: readonly(total),
    isLoading: readonly(isLoading),
    isFinished: readonly(isFinished),
    refresh,
    loadMore,
  };
}
