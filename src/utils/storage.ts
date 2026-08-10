import { STORAGE_PREFIX } from "@/constants";

interface StorageRecord<T> {
  value: T;
  /** 过期时间戳，0 表示永不过期 */
  expiredAt: number;
}

/**
 * 写入本地缓存。
 *
 * @param key - 缓存键名。
 * @param value - 缓存值，支持任意可序列化数据。
 * @param ttl - 有效期（毫秒），省略则永不过期。
 */
export function setStorage<T>(key: string, value: T, ttl?: number): void {
  const record: StorageRecord<T> = {
    value,
    expiredAt: ttl ? Date.now() + ttl : 0,
  };
  uni.setStorageSync(key, record);
}

/**
 * 读取本地缓存，已过期的数据会被清除并返回默认值。
 *
 * @param key - 缓存键名。
 * @param defaultValue - 未命中或已过期时返回的值。
 * @returns 缓存值或默认值。
 */
export function getStorage<T>(key: string, defaultValue: T): T;
export function getStorage<T>(key: string): T | undefined;
export function getStorage<T>(key: string, defaultValue?: T): T | undefined {
  const record = uni.getStorageSync(key) as StorageRecord<T> | "" | undefined;
  if (!record || typeof record !== "object" || !("value" in record)) {
    return defaultValue;
  }
  if (record.expiredAt && record.expiredAt < Date.now()) {
    uni.removeStorageSync(key);
    return defaultValue;
  }
  return record.value;
}

export function removeStorage(key: string): void {
  uni.removeStorageSync(key);
}

/** 只清理当前应用写入的缓存，避免影响宿主或第三方 SDK 的数据。 */
export function clearAppStorage(): void {
  const { keys } = uni.getStorageInfoSync();
  keys.filter((key) => key.startsWith(STORAGE_PREFIX)).forEach((key) => uni.removeStorageSync(key));
}
