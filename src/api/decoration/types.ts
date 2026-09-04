/** 首页 Banner。 */
export interface HomeBanner {
  id: string;
  imageUrl: string;
  linkUrl?: string | null;
}

/** 首页滚动公告。 */
export interface HomeNotice {
  id: string;
  title: string;
  content: string;
}

/** 独立配置的首页卡片。 */
export interface HomeCard {
  title: string;
  imageUrl: string;
  content: string;
}

/** 首页装修聚合数据。 */
export interface HomeDecoration {
  banners: HomeBanner[];
  notices: HomeNotice[];
  brandContent: string;
  cards: HomeCard[];
}
