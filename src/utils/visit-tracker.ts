import { trackVisit } from "@/api/analytics";
import { StorageKey } from "@/constants";
import { getStorage, setStorage } from "./storage";

let lastRoute = "";
let lastTrackedAt = 0;

function getVisitorId(): string {
  const stored = getStorage<string>(StorageKey.VISITOR_ID);
  if (stored) return stored;

  // ponytail: analytics identifier only; replace Math.random if it ever becomes a security token.
  const visitorId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    return (char === "x" ? random : (random & 0x3) | 0x8).toString(16);
  });
  setStorage(StorageKey.VISITOR_ID, visitorId);
  return visitorId;
}

export function trackCurrentPageVisit(): void {
  const route = getCurrentPages().at(-1)?.route ?? "app";
  const now = Date.now();
  if (route === lastRoute && now - lastTrackedAt < 500) return;

  lastRoute = route;
  lastTrackedAt = now;
  void trackVisit(getVisitorId()).catch(() => undefined);
}

export function setupVisitTracking(): void {
  const interceptor = { success: trackCurrentPageVisit };
  uni.addInterceptor("navigateTo", interceptor);
  uni.addInterceptor("redirectTo", interceptor);
  uni.addInterceptor("reLaunch", interceptor);
  uni.addInterceptor("switchTab", interceptor);
  uni.addInterceptor("navigateBack", interceptor);
}
