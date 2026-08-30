import request from "@/utils/request";

export function trackVisit(visitorId: string): Promise<{ success: boolean }> {
  return request({
    url: "/app/analytics/visit",
    method: "POST",
    data: { visitorId },
    skipAuth: true,
    skipErrorToast: true,
  });
}
