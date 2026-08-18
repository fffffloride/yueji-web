import { request } from "@/utils/request";
import type { LoginRequest, LoginResult, MemberProfile, UserForm, UserInfo } from "./types";

const AUTH_BASE_URL = "/app/auth";
const MEMBER_BASE_URL = "/app/member";

const toUserInfo = (profile: MemberProfile): UserInfo => ({
  id: profile.id,
  nickname: profile.nickname,
  avatar: profile.avatar ?? "",
  phone: profile.mobile ?? "",
  totalConsumption: profile.totalSpent,
  points: profile.points,
});

const UserAPI = {
  /** 微信静默登录，用 code 换取会员 token。 */
  login(data: LoginRequest) {
    return request<LoginResult, Pick<LoginRequest, "code">>({
      url: `${AUTH_BASE_URL}/silent-login`,
      method: "POST",
      data: { code: data.code },
      skipAuth: true,
    });
  },

  /** 获取当前登录用户信息。 */
  async getInfo() {
    return toUserInfo(await request<MemberProfile>({ url: `${MEMBER_BASE_URL}/profile` }));
  },

  /** 更新个人资料。 */
  async update(data: UserForm) {
    const profile = await request<MemberProfile, Pick<UserForm, "nickname" | "avatar" | "gender">>({
      url: `${MEMBER_BASE_URL}/profile`,
      method: "PUT",
      data: { nickname: data.nickname, avatar: data.avatar, gender: data.gender },
    });
    return toUserInfo(profile);
  },
};

export default UserAPI;
export * from "./types";
