import DistributionAPI, { type DistributionProfile } from "@/api/distribution";
import { hasDistributionAccess } from "@/utils/distribution";
import { getAccessToken } from "@/utils/auth";

/** 所有分销页进入时查询本人身份，停用代理可读历史数据，团队仅启用代理可读。 */
export function useDistributionPage<T>(
  fetcher: (profile: DistributionProfile) => Promise<T>,
  teamOnly = false
) {
  const profile = ref<DistributionProfile | null>(null);
  const data = shallowRef<T | null>(null);
  const loading = ref(true);
  const error = ref("");
  const denied = ref(false);
  let sequence = 0;

  async function load() {
    const current = ++sequence;
    const token = getAccessToken();
    loading.value = true;
    error.value = "";
    denied.value = false;
    try {
      const result = await DistributionAPI.getProfile();
      if (current !== sequence || token !== getAccessToken()) return;
      if (
        !hasDistributionAccess(result.agent?.status) ||
        (teamOnly && result.agent?.status !== 1)
      ) {
        data.value = null;
        profile.value = null;
        denied.value = true;
        throw new Error(
          teamOnly && result.agent?.status === 3
            ? "代理身份已停用，无法查看团队"
            : "当前账号未开通分销身份，请联系运营人员"
        );
      }
      profile.value = result;
      const value = await fetcher(result);
      if (current === sequence && token === getAccessToken()) data.value = value;
    } catch (cause) {
      if (current === sequence)
        error.value = cause instanceof Error ? cause.message : "加载失败，请重试";
    } finally {
      if (current === sequence) {
        if (token !== getAccessToken()) {
          profile.value = null;
          data.value = null;
          error.value = "登录状态已变化，请重新加载";
        }
        loading.value = false;
      }
    }
  }

  onShow(() => {
    void load();
  });
  onPullDownRefresh(async () => {
    await load();
    uni.stopPullDownRefresh();
  });
  onUnload(() => {
    sequence++;
  });
  return { profile, data, loading, error, denied, load };
}
