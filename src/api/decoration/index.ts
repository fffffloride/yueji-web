import { request } from "@/utils/request";
import type { HomeDecoration } from "./types";

const DECORATION_BASE_URL = "/app/decoration";

const DecorationAPI = {
  /** 获取已上线的 Banner、公告与品牌背书。 */
  async getHome(): Promise<HomeDecoration> {
    const result = await request<Partial<HomeDecoration>>({
      url: `${DECORATION_BASE_URL}/home`,
      skipAuth: true,
    });
    return {
      banners: result.banners ?? [],
      notices: result.notices ?? [],
      brandContent: result.brandContent ?? "",
      cards: result.cards ?? [],
      promoCards: result.promoCards ?? [],
    };
  },
};

export default DecorationAPI;
export * from "./types";
