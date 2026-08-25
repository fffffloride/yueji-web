import type { ProductCatalog } from "../api/product/types";

export interface CatalogAnchor {
  id: string;
  top: number;
}

/** 基于首次加载的完整目录生成疼痛友好视图。 */
export function filterPainFriendlyCatalog(
  catalog: ProductCatalog,
  enabled: boolean
): ProductCatalog {
  if (!enabled) return catalog;
  return {
    groups: catalog.groups
      .map((group) => ({
        ...group,
        sections: group.sections
          .map((section) => {
            const products = section.products.filter((product) => product.painFriendly);
            return { ...section, total: products.length, products };
          })
          .filter((section) => section.total > 0),
      }))
      .filter((group) => group.sections.length > 0),
  };
}

/** 返回当前位置对应的最后一个已越过锚点；列表到底时强制选中末项。 */
export function findActiveAnchor(
  anchors: CatalogAnchor[],
  position: number,
  atEnd = false
): string {
  if (anchors.length === 0) return "";
  if (atEnd) return anchors[anchors.length - 1].id;
  let active = anchors[0].id;
  for (const anchor of anchors) {
    if (anchor.top > position) break;
    active = anchor.id;
  }
  return active;
}
