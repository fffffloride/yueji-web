import type { BaseQueryParams } from "../common";

/** 商品分类，支持三级结构。 */
export interface CategoryItem {
  id: string;
  name: string;
  icon?: string;
  sort: number;
  children?: CategoryItem[];
}

/** 商品列表项。 */
export interface ProductItem {
  id: string;
  name: string;
  /** 副标题 */
  subTitle: string;
  /** 主图 */
  cover: string;
  /** 原价（分） */
  originalPrice: number;
  /** 现售价（分） */
  price: number;
  sales: number;
  painFriendly: boolean;
  /** 推荐 / 新品 / 热卖等标签 */
  tags: string[];
}

export interface ProductCatalogSection {
  id: string;
  name: string;
  total: number;
  products: ProductItem[];
}

export interface ProductCatalogGroup {
  id: string;
  name: string;
  fixed?: boolean;
  sections: ProductCatalogSection[];
}

export interface ProductCatalog {
  groups: ProductCatalogGroup[];
}

/** 商品规格（SKU）。 */
export interface ProductSku {
  id: string;
  /** 规格名，如 "面部 · 1ml" */
  name: string;
  price: number;
  originalPrice: number;
  stock: number;
  /** 该 SKU 对应的预约服务间隔（天），用于预约日历计算 */
  serviceInterval?: number;
}

/** 商品详情。 */
export interface ProductDetail extends ProductItem {
  /** 轮播图，支持图片与短视频 */
  banners: string[];
  video?: string;
  stock: number;
  /** 详情富文本 */
  detailHtml: string;
  /** 产品情况说明 */
  description: string;
  /** 适用人群 */
  suitableCrowd: string;
  /** 注意事项 */
  precautions: string;
  /** 术后护理 */
  aftercare: string;
  skus: ProductSku[];
  isFavorite: boolean;
  /** 相关推荐商品 ID */
  relatedProductIds: string[];
}

export interface ProductQueryParams extends BaseQueryParams {
  categoryId?: string;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  /** 排序维度：sales 销量、price 价格、new 新品 */
  sortBy?: "sales" | "price" | "new";
}
