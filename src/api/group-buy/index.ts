import { request } from "@/utils/request";
import type { GroupBuyActivity, GroupBuyGroupDetail, GroupBuyOrderResult } from "./types";

const GROUP_BUY_BASE_URL = "/app/group-buy";

const GroupBuyAPI = {
  getActivity(id: string, skipErrorToast = false) {
    return request<GroupBuyActivity>({
      url: `${GROUP_BUY_BASE_URL}/activities/${id}`,
      skipErrorToast,
    });
  },

  getGroup(id: string) {
    return request<GroupBuyGroupDetail>({ url: `${GROUP_BUY_BASE_URL}/groups/${id}` });
  },

  start(activityId: string) {
    return request<GroupBuyOrderResult, { activityId: string }>({
      url: `${GROUP_BUY_BASE_URL}/groups`,
      method: "POST",
      data: { activityId },
      loading: "正在发起拼团",
    });
  },

  join(groupId: string) {
    return request<GroupBuyOrderResult>({
      url: `${GROUP_BUY_BASE_URL}/groups/${groupId}/join`,
      method: "POST",
      loading: "正在参与拼团",
    });
  },
};

export default GroupBuyAPI;
export * from "./types";
