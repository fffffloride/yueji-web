<template>
  <YjPage>
    <view class="login">
      <view class="login__brand">悦己 · DLumière</view>
      <view class="login__slogan">专业、安全、透明的医美服务体验</view>

      <wd-button
        type="primary"
        size="large"
        block
        :loading="isSubmitting"
        @click="handleSubmit"
      >
        微信一键登录
      </wd-button>

      <view class="login__agreement">
        <wd-checkbox v-model="isAgreed" />
        <text>我已阅读并同意</text>
        <text class="login__link" @click="openAgreement(AgreementType.USER_AGREEMENT)">
          《用户协议》
        </text>
        <text>和</text>
        <text class="login__link" @click="openAgreement(AgreementType.PRIVACY_POLICY)">
          《隐私政策》
        </text>
      </view>
    </view>
  </YjPage>
</template>

<script setup lang="ts">
import { AgreementType } from "@/api/agreement";
import { RoutePath } from "@/constants";
import { useLogin } from "@/composables/useLogin";
import { navigate } from "@/utils/navigate";

const { isSubmitting, handleLogin } = useLogin();

/** 登录成功后的回跳地址，由 toLogin 带入。 */
const from = ref("");
const inviterId = ref("");
const isAgreed = ref(false);

onLoad((options) => {
  from.value = options?.from ?? "";
  inviterId.value = options?.inviterId ?? "";
});

async function handleSubmit() {
  if (!isAgreed.value) {
    uni.showToast({ title: "请先阅读并同意用户协议", icon: "none" });
    return;
  }
  await handleLogin(from.value, inviterId.value || undefined);
}

function openAgreement(type: AgreementType) {
  navigate(RoutePath.AGREEMENT, { params: { type } });
}
</script>

<style lang="scss" scoped>
.login {
  padding-top: 160rpx;
  text-align: center;
}

.login__brand {
  font-size: $font-size-xl;
  font-weight: bold;
  color: $color-primary;
}

.login__slogan {
  margin: $spacing-sm 0 120rpx;
  font-size: $font-size-sm;
  color: $color-text-sub;
}

.login__agreement {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
  align-items: center;
  justify-content: center;
  margin-top: $spacing-lg;
  font-size: $font-size-xs;
  color: $color-text-sub;
}

.login__link {
  color: $color-primary;
}
</style>
