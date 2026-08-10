/** 后端统一返回结构，见需求文档 6.2。 */
export interface ApiResult<T = unknown> {
  code: number;
  data: T;
  message: string;
}

/** 分页请求的公共参数。 */
export interface BaseQueryParams {
  pageNum: number;
  pageSize: number;
  sortBy?: string;
  order?: "asc" | "desc";
}

/** 分页返回结构。 */
export interface PageResult<T> {
  list: T[];
  total: number;
}

/** 通用下拉选项。 */
export interface OptionItem {
  value: string | number;
  label: string;
  children?: OptionItem[];
}
