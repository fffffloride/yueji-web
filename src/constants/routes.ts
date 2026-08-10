/** 集中管理页面路径，避免字符串散落在各处。 */
export const RoutePath = {
  HOME: "/pages/home/index",
  PRODUCT: "/pages/product/index",
  APPOINTMENT: "/pages/appointment/index",
  CART: "/pages/cart/index",
  MINE: "/pages/mine/index",
  LOGIN: "/pages/login/index",

  PRODUCT_SEARCH: "/pages-sub/product/search/index",
  PRODUCT_LIST: "/pages-sub/product/list/index",
  PRODUCT_DETAIL: "/pages-sub/product/detail/index",

  ORDER_CONFIRM: "/pages-sub/order/confirm/index",
  ORDER_PAY_RESULT: "/pages-sub/order/pay-result/index",
  ORDER_LIST: "/pages-sub/order/list/index",
  ORDER_DETAIL: "/pages-sub/order/detail/index",
  ORDER_GIFT: "/pages-sub/order/gift/index",
  ORDER_PROXY_PAY: "/pages-sub/order/proxy-pay/index",

  DOCTOR_LIST: "/pages-sub/appointment/doctor-list/index",
  DOCTOR_DETAIL: "/pages-sub/appointment/doctor-detail/index",
  BOOKING: "/pages-sub/appointment/booking/index",
  MY_APPOINTMENT: "/pages-sub/appointment/my-list/index",

  USER_PROFILE: "/pages-sub/user/profile/index",
  USER_WALLET: "/pages-sub/user/wallet/index",
  USER_POINTS: "/pages-sub/user/points/index",
  USER_MEMBER: "/pages-sub/user/member/index",
  USER_FAVORITE: "/pages-sub/user/favorite/index",
  USER_COUPON: "/pages-sub/user/coupon/index",
  USER_ADDRESS: "/pages-sub/user/address/index",
  USER_MESSAGE: "/pages-sub/user/message/index",
  USER_SETTINGS: "/pages-sub/user/settings/index",
  USER_HELP: "/pages-sub/user/help/index",

  GROUP_BUY_LIST: "/pages-sub/marketing/group-buy-list/index",
  GROUP_BUY_DETAIL: "/pages-sub/marketing/group-buy-detail/index",
  LOTTERY: "/pages-sub/marketing/lottery/index",
  POINTS_MALL: "/pages-sub/marketing/points-mall/index",
  REDEEM_CODE: "/pages-sub/marketing/redeem-code/index",
  ACTIVITY: "/pages-sub/marketing/activity/index",

  DISTRIBUTION: "/pages-sub/distribution/index/index",
  DISTRIBUTION_MERCHANT: "/pages-sub/distribution/merchant/index",
  DISTRIBUTION_TEAM: "/pages-sub/distribution/team/index",
  DISTRIBUTION_COMMISSION: "/pages-sub/distribution/commission/index",
  DISTRIBUTION_MATERIAL: "/pages-sub/distribution/material/index",
  DISTRIBUTION_TASK: "/pages-sub/distribution/task/index",
  DISTRIBUTION_WALLET: "/pages-sub/distribution/wallet/index",

  NOTICE: "/pages-sub/common/notice/index",
  BRAND: "/pages-sub/common/brand/index",
  AGREEMENT: "/pages-sub/common/agreement/index",
  WEBVIEW: "/pages-sub/common/webview/index",
} as const;

/** TabBar 页面路径，跳转时需要用 switchTab。 */
export const TAB_BAR_PATHS: string[] = [
  RoutePath.HOME,
  RoutePath.PRODUCT,
  RoutePath.APPOINTMENT,
  RoutePath.CART,
  RoutePath.MINE,
];
