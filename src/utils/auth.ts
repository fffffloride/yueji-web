import { StorageKey } from "@/constants";
import { getStorage, removeStorage, setStorage } from "./storage";

export function getAccessToken(): string {
  return getStorage<string>(StorageKey.ACCESS_TOKEN, "");
}

export function setAccessToken(token: string, ttl?: number): void {
  setStorage(StorageKey.ACCESS_TOKEN, token, ttl);
}

export function clearAccessToken(): void {
  removeStorage(StorageKey.ACCESS_TOKEN);
}

export function isLoggedIn(): boolean {
  return !!getAccessToken();
}
