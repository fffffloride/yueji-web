const APP_PREFIX = "yueji";

/** 本地缓存键名，统一前缀便于按应用批量清理。 */
export const StorageKey = {
  ACCESS_TOKEN: `${APP_PREFIX}:auth:access_token`,
  REFRESH_TOKEN: `${APP_PREFIX}:auth:refresh_token`,
  USER_INFO: `${APP_PREFIX}:user:info`,
  CART: `${APP_PREFIX}:cart`,
  SEARCH_HISTORY: `${APP_PREFIX}:product:search_history`,
  /** 首页活动弹窗当日已关闭标记 */
  HOME_POPUP_CLOSED_AT: `${APP_PREFIX}:home:popup_closed_at`,
} as const;

export const STORAGE_PREFIX = APP_PREFIX;
