import { request } from "@/utils/request";
import type { PageResult } from "../common";
import type { CategoryItem, ProductDetail, ProductItem, ProductQueryParams } from "./types";

const PRODUCT_BASE_URL = "/product";

const ProductAPI = {
  /** 获取商品分类列表（含子级）。 */
  getCategories() {
    return request<CategoryItem[]>({ url: `${PRODUCT_BASE_URL}/categories` });
  },

  /** 获取商品分页列表。 */
  getPage(params: ProductQueryParams) {
    return request<PageResult<ProductItem>>({ url: `${PRODUCT_BASE_URL}/list`, params });
  },

  /** 获取商品详情。 */
  getDetail(id: string) {
    return request<ProductDetail>({ url: `${PRODUCT_BASE_URL}/${id}` });
  },

  /** 商品搜索。 */
  search(params: ProductQueryParams) {
    return request<PageResult<ProductItem>>({ url: `${PRODUCT_BASE_URL}/search`, params });
  },
};

export default ProductAPI;
export * from "./types";
