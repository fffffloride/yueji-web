import { request } from "@/utils/request";
import type { PageResult } from "../common";
import type {
  CategoryItem,
  ProductCatalog,
  ProductDetail,
  ProductItem,
  ProductQueryParams,
} from "./types";

const PRODUCT_BASE_URL = "/app/product";

/** 后端商品卡片结构 */
interface ServerProductCard {
  id: string;
  name: string;
  subTitle?: string;
  mainImage?: string;
  tags: string[];
  price: number;
  originalPrice?: number;
  sales: number;
  painFriendly?: boolean;
}

interface ServerProductCatalog {
  groups: {
    id: string;
    name: string;
    sections: {
      id: string;
      name: string;
      total: number;
      products: ServerProductCard[];
    }[];
  }[];
}

/** 后端商品详情结构 */
interface ServerProductDetail extends ServerProductCard {
  album: string[];
  videoUrl?: string;
  detail?: string;
  usageNote?: string;
  stock: number;
  skus: {
    id: string;
    name: string;
    specs?: string;
    price: number;
    originalPrice?: number;
    stock: number;
  }[];
}

const toProductItem = (p: ServerProductCard): ProductItem => ({
  id: p.id,
  name: p.name,
  subTitle: p.subTitle || "",
  cover: p.mainImage || "",
  price: p.price,
  originalPrice: p.originalPrice ?? p.price,
  sales: p.sales,
  painFriendly: Boolean(p.painFriendly),
  tags: p.tags ?? [],
});

/** 前端排序参数转后端 sortType */
const toSortType = (params: ProductQueryParams): string => {
  switch (params.sortBy) {
    case "sales":
      return "sales";
    case "price":
      return params.order === "desc" ? "priceDesc" : "priceAsc";
    case "new":
      return "new";
    default:
      return "default";
  }
};

const toPageParams = (params: ProductQueryParams) => ({
  pageNum: params.pageNum,
  pageSize: params.pageSize,
  categoryId: params.categoryId,
  keywords: params.keyword,
  tag: (params as { tag?: string }).tag,
  sortType: toSortType(params),
});

const ProductAPI = {
  /** 获取按一级/二级分类分组的连续商品目录。 */
  async getCatalog(): Promise<ProductCatalog> {
    const result = await request<ServerProductCatalog>({ url: `${PRODUCT_BASE_URL}/catalog` });
    return {
      groups: (result.groups ?? []).map((group) => ({
        ...group,
        sections: group.sections.map((section) => ({
          ...section,
          products: section.products.map(toProductItem),
        })),
      })),
    };
  },

  /** 获取商品分类树（仅启用）。 */
  getCategories() {
    return request<CategoryItem[]>({ url: `${PRODUCT_BASE_URL}/categories` });
  },

  /** 获取商品分页列表。 */
  async getPage(params: ProductQueryParams): Promise<PageResult<ProductItem>> {
    const result = await request<PageResult<ServerProductCard>>({
      url: `${PRODUCT_BASE_URL}/page`,
      params: toPageParams(params),
    });
    return { list: (result.list ?? []).map(toProductItem), total: result.total };
  },

  /** 获取商品详情。 */
  async getDetail(id: string): Promise<ProductDetail> {
    const p = await request<ServerProductDetail>({ url: `${PRODUCT_BASE_URL}/${id}` });
    const banners = p.album?.length ? p.album : p.mainImage ? [p.mainImage] : [];
    return {
      ...toProductItem(p),
      banners,
      video: p.videoUrl || undefined,
      stock: p.stock,
      detailHtml: p.detail || "",
      description: p.usageNote || "",
      // 以下字段后端暂未拆分，随后续迭代补充
      suitableCrowd: "",
      precautions: "",
      aftercare: "",
      skus: (p.skus ?? []).map((s) => ({
        id: s.id,
        name: s.name,
        price: s.price,
        originalPrice: s.originalPrice ?? s.price,
        stock: s.stock,
      })),
      isFavorite: false,
      relatedProductIds: [],
    };
  },

  /** 商品搜索（与列表同一接口，keyword 匹配商品名）。 */
  search(params: ProductQueryParams) {
    return ProductAPI.getPage(params);
  },
};

export default ProductAPI;
export * from "./types";
