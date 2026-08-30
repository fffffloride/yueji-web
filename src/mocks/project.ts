/**
 * 项目页静态数据（还原设计稿阶段使用，后续替换为真实接口）。
 * 金额一律为整数分，展示时经 formatPrice 转换。
 */

/** 左侧分类。 */
export interface ProjectCategory {
  label: string;
  badge?: string;
}

/** 商品条目。 */
export interface ProjectItem {
  name: string;
  sub: string;
  sold: string;
  /** 现价（分） */
  price: number;
  /** 优惠文案，如 "优惠1300" */
  discount: string;
  badge?: string;
  /** 是否疼痛友好 */
  isFriendly?: boolean;
}

/** 右侧商品分组。 */
export interface ProjectSection {
  title: string;
  items: ProjectItem[];
}

export const projectCategories: ProjectCategory[] = [
  { label: "今日主推", badge: "热卖" },
  { label: "明星单品" },
  { label: "水光抗衰" },
  { label: "光电抗衰" },
  { label: "注射抗衰" },
  { label: "皮肤管理" },
  { label: "大健康" },
  { label: "家用好物" },
];

/** 分类 → 商品分组。未配置的类目展示空态。 */
export const projectData: Record<string, ProjectSection[]> = {
  今日主推: [
    {
      title: "今日主推",
      items: [
        { name: "极光胶原大排灯", sub: "居家版BBL HERO不老光", sold: "已售199", price: 299900, discount: "优惠1300" },
      ],
    },
  ],
  明星单品: [
    {
      title: "明星单品",
      items: [
        { name: "奇迹胶原", sub: "售出超6万支", sold: "售出超6万支", price: 89900, discount: "优惠1100", isFriendly: true },
        { name: "奇迹童颜", sub: "超微球童颜水光，全脸嫩肤收紧", sold: "售出超10万支", price: 99900, discount: "优惠2999", badge: "周年纪念", isFriendly: true },
      ],
    },
  ],
  水光抗衰: [
    {
      title: "再生水光 (1)",
      items: [
        { name: "奇迹童颜", sub: "超微球童颜水光，全脸嫩肤收紧", sold: "售出超10万支", price: 99900, discount: "优惠2999", badge: "周年纪念", isFriendly: true },
      ],
    },
    {
      title: "胶原水光 (5)",
      items: [
        { name: "奇迹胶原-冰冰胶原", sub: "养出女明星好皮肤", sold: "售出超6万支", price: 489900, discount: "优惠4696", isFriendly: true },
        { name: "奇迹胶原", sub: "重塑婴儿皮肤质地", sold: "售出超6万支", price: 89900, discount: "优惠1100", isFriendly: true },
        { name: "厚皮胶原", sub: "真表皮增厚，强屏障更抗老", sold: "已售8058份", price: 174900, discount: "优惠1850" },
        { name: "胶原瀑布2.0", sub: "胶原直补，嘭弹水润", sold: "已售212份", price: 279900, discount: "优惠2200", badge: "青春原创", isFriendly: true },
      ],
    },
  ],
  光电抗衰: [
    {
      title: "光电爆脂 (1)",
      items: [
        { name: "InMode钻石超塑", sub: "脂肪抗衰，爆脂紧致", sold: "已售27791份", price: 30900, discount: "优惠390", isFriendly: true },
      ],
    },
    {
      title: "激光皮秒 (4)",
      items: [
        { name: "极光色修", sub: "标本兼治，无暇净斑", sold: "已售155份", price: 174900, discount: "优惠1850" },
        { name: "极光美白", sub: "高效美白净斑，极光灯泡肌", sold: "已售9305份", price: 79900, discount: "优惠1200" },
        { name: "白雪公主光", sub: "双光联合，双效美白", sold: "已售1656份", price: 154900, discount: "优惠3049" },
        { name: "半岛白极光", sub: "全模式高效美白祛斑", sold: "已售18439份", price: 84900, discount: "优惠750" },
      ],
    },
  ],
};

/** 顶部横幅轮播。 */
export interface ProjectBanner {
  title: string;
  sub: string;
  bg: string;
}

export const projectBanners: ProjectBanner[] = [
  { title: "奇迹童颜", sub: "好品好价\n福利放送", bg: "var(--yj-color-surface-rose)" },
  { title: "超声面雕", sub: "面部提升 瘦脸紧致", bg: "var(--yj-color-primary-tint)" },
  { title: "紧致提升", sub: "Coolfast新项目", bg: "var(--yj-color-surface-warm)" },
];

/** 门店信息与距离。 */
export const projectStore = {
  name: "悦己轻医美(上海前滩陆悦广场店)...",
  distance: "距您24.34km",
};
