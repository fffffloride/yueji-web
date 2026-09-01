/**
 * 首页静态数据（还原设计稿阶段使用，后续替换为真实接口）。
 * 金额一律为整数分，展示时经 formatPrice 转换。
 */

/** Hero 轮播条目。 */
export interface HeroSlide {
  /** 背景色，取 CSS 自定义属性，避免硬编码 */
  bg: string;
  tag: string;
  title: string;
  subtitle: string;
  features: string;
  /** 价格（分） */
  price: number;
}

/** 快捷入口条目。 */
export interface QuickEntry {
  label: string;
  /** 数值，未登录时展示 "—" */
  value?: string;
  /** wd-icon 图标名，有图标时优先展示图标 */
  icon?: string;
}

/** 活动宫格卡片。 */
export interface PromoCard {
  title: string;
  sub: string;
  bg: string;
  badge?: string;
}

/** 热榜商品。 */
export interface HotProduct {
  rank: number;
  tag: string;
  name: string;
  desc: string;
  rating: string;
  users: string;
  /** 现价（分） */
  price: number;
  /** 原价（分） */
  original: number;
  bg: string;
}

/** 品牌区块。 */
export interface BrandSection {
  title: string;
  sub: string;
  bg: string;
}

/** 附近门店。 */
export interface NearbyStore {
  name: string;
  address: string;
  cityTag: string;
}

export const heroSlides: HeroSlide[] = [
  {
    bg: "var(--yj-color-surface-warm)",
    tag: "新品上市",
    title: "超声面雕",
    subtitle: "全面精细，才叫面雕",
    features: "面部提升｜瘦脸紧致｜全层改善",
    price: 499900,
  },
  {
    bg: "var(--yj-color-surface-rose)",
    tag: "热销推荐",
    title: "奇迹童颜",
    subtitle: "超微球童颜水光，全脸嫩肤",
    features: "焕发年轻光彩｜自然美感",
    price: 99900,
  },
  {
    bg: "var(--yj-color-primary-tint)",
    tag: "限时特惠",
    title: "春日自由",
    subtitle: "唤醒沉睡的美",
    features: "光泽嫩肤｜紧致提升",
    price: 399900,
  },
];

/** 滚动信任条文案。 */
export const trustItems: string[] = [
  "ISO37301安全合规认证",
  "全职医生团队，正品保证",
  "累计治疗量超186万次",
  "多城连锁门店，到店即享",
];

export const quickEntries: QuickEntry[] = [
  { label: "待预约", value: "—" },
  { label: "待到店", value: "—" },
  { label: "服务记录", value: "—" },
  { label: "加入社群", icon: "usergroup-add" },
];

/** 新人券金额（元）与倒计时初始秒数。 */
export const newUserCoupon = {
  amount: "350",
  /** 距失效倒计时初始秒数（约 4.9 小时） */
  seconds: 17750,
};

export const promoCards: PromoCard[] = [
  {
    title: "L3 升级冲榜赛",
    sub: "领升级好礼\n享高阶权益",
    bg: "linear-gradient(135deg, var(--yj-color-primary-tint), var(--yj-color-bg))",
  },
  {
    title: "活动专区",
    sub: "解锁变美礼遇",
    bg: "linear-gradient(135deg, var(--yj-color-surface-warm), var(--yj-color-bg))",
  },
  {
    title: "悦己医疗团队",
    sub: "选择医生，选择安心",
    bg: "linear-gradient(135deg, var(--yj-color-primary-tint), var(--yj-color-bg))",
    badge: "NEW",
  },
  {
    title: "姐妹众测",
    sub: "JOJO\n灵动胶原",
    bg: "linear-gradient(135deg, var(--yj-color-primary-tint), var(--yj-color-surface-warm))",
  },
];

export const hotTabs: string[] = ["全部", "水光抗衰", "光电抗衰", "注射抗衰", "皮肤管理"];

export const hotProducts: HotProduct[] = [
  {
    rank: 1,
    tag: "本月热销推荐",
    name: "新一代热玛吉",
    desc: "搭配减痛管理，舒适抗衰",
    rating: "99.6%好评率",
    users: "1.3万位用户推荐",
    price: 999900,
    original: 1599900,
    bg: "var(--yj-color-surface-warm)",
  },
  {
    rank: 2,
    tag: "本月热销推荐",
    name: "再生水光 奇迹童颜",
    desc: "超微球童颜水光，全脸嫩肤收紧",
    rating: "99.8%好评率",
    users: "2.8万位用户推荐",
    price: 99900,
    original: 399800,
    bg: "var(--yj-color-primary-tint)",
  },
  {
    rank: 3,
    tag: "本月热销推荐",
    name: "紧致提升 超声面雕",
    desc: "可视化超声抗衰，皮贴骨轮廓提升",
    rating: "99.7%好评率",
    users: "1.9万位用户推荐",
    price: 499900,
    original: 999900,
    bg: "var(--yj-color-surface-warm)",
  },
];

export const nearbyStore: NearbyStore = {
  name: "悦己轻医美(苏州中心广场店) No.041",
  address: "苏州市工业园区中心广场北楼3楼（连廊口）",
  cityTag: "苏州市",
};

export const brandSections: BrandSection[] = [
  {
    title: "品牌起源",
    sub: "关于悦己轻医美。",
    bg: "linear-gradient(135deg, var(--yj-color-primary-tint), var(--yj-color-bg))",
  },
  {
    title: "合理定价",
    sub: "好的医美，\n也可以有好的价格。",
    bg: "linear-gradient(135deg, var(--yj-color-surface-warm), var(--yj-color-bg))",
  },
  {
    title: "正品保障",
    sub: "使用正品，我们的底线。",
    bg: "linear-gradient(135deg, var(--yj-color-primary-tint), var(--yj-color-bg))",
  },
  {
    title: "医生团队",
    sub: "相信他们，相信我们。",
    bg: "linear-gradient(135deg, var(--yj-color-surface-warm), var(--yj-color-primary-tint))",
  },
  {
    title: "安全保证",
    sub: "不妥协，不冒进。",
    bg: "linear-gradient(135deg, var(--yj-color-primary-tint), var(--yj-color-surface-warm))",
  },
];

/** 品牌故事文案。 */
export const brandStory = {
  slogan: "悦己DLumière 是我们的人生作品。",
  paragraphs: [
    "悦己DLumière 是专注抗衰的轻医美连锁品牌。秉持医美整体论的医疗主张，我们推崇联合治疗，从问题复杂的成因出发，进行严谨的配方及术式搭配，并匹配合理公平的价格。同时，以真诚的医美观及自然健康的美学理念，给予每位客人以完整周到的服务。所有不安，都在这里被呵护。",
    "青春面前，人人平等。",
    "如今，悦己DLumière 已在北京、上海、广州、深圳、苏州等城市陆续开设门店，期待与你见面。",
  ],
};
