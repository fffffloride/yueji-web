import { request } from "@/utils/request";
import type { LoginRequest, LoginResult, UserForm, UserInfo, UserPoints, UserWallet } from "./types";

const USER_BASE_URL = "/user";

const UserAPI = {
  /** 微信登录，用 code 换取 token 与用户信息。 */
  login(data: LoginRequest) {
    return request<LoginResult, LoginRequest>({
      url: `${USER_BASE_URL}/login`,
      method: "POST",
      data,
      skipAuth: true,
    });
  },

  /** 获取当前登录用户信息。 */
  getInfo() {
    return request<UserInfo>({ url: `${USER_BASE_URL}/info` });
  },

  /** 更新个人资料。 */
  update(data: UserForm) {
    return request<void, UserForm>({ url: `${USER_BASE_URL}/info`, method: "PUT", data });
  },

  /** 获取用户积分。 */
  getPoints() {
    return request<UserPoints>({ url: `${USER_BASE_URL}/points` });
  },

  /** 获取用户钱包。 */
  getWallet() {
    return request<UserWallet>({ url: `${USER_BASE_URL}/wallet` });
  },
};

export default UserAPI;
export * from "./types";
