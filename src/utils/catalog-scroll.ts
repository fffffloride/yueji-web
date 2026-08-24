export interface CatalogAnchor {
  id: string;
  top: number;
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
