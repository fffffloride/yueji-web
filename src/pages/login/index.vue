<template>
  <YjPage :padded="false">
    <view class="login">
      <!-- 品牌区 -->
      <view class="login__brand">
        <YjLogo :size="96" />
        <view class="login__brand-name">悦己DLumière</view>
        <view class="login__brand-slogan">悦 己 轻 医 美</view>
      </view>

      <!-- 表单区 -->
      <view class="login__form">
        <view class="login__notice">
          <view class="login__notice-icon">i</view>
          <text>未满18周岁用户请开启未成年人模式</text>
        </view>

        <view class="login__agreement">
          <view
            class="login__checkbox"
            :class="{ 'login__checkbox--checked': isAgreed }"
            @click="isAgreed = !isAgreed"
          >
            <wd-icon v-if="isAgreed" name="check-bold" size="22rpx" color="var(--yj-color-bg)" />
          </view>
          <view class="login__agreement-text">
            <text>我已阅读并同意以下协议</text>
            <text class="login__agreement-link" @click="navigate(RoutePath.AGREEMENT)">
              《悦己会员使用协议》
            </text>
            <text class="login__agreement-link" @click="navigate(RoutePath.AGREEMENT)">
              《隐私政策》
            </text>
            <text class="login__agreement-link" @click="navigate(RoutePath.AGREEMENT)">
              《悦己会员活动的条款和条件》
            </text>
          </view>
        </view>

        <view class="login__button login__button--primary" @click="handleSubmit">手机号快捷登录</view>
        <view class="login__button login__button--plain" @click="handleComingSoon">短信验证码登录</view>
      </view>

      <!-- 品牌形象占位图 -->
      <view class="login__photo" />

      <view class="login__skip" @click="handleSkip">暂不登录</view>
      <view class="login__hint">未注册手机号将创建悦己账号</view>
      <view class="login__bar" />
    </view>
  </YjPage>
</template>

<script setup lang="ts">
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
  if (isSubmitting.value) return;
  if (!isAgreed.value) {
    uni.showToast({ title: "请先阅读并同意协议", icon: "none" });
    return;
  }
  await handleLogin(from.value, inviterId.value || undefined);
}

function handleSkip() {
  if (from.value) {
    uni.navigateBack({ fail: () => uni.switchTab({ url: RoutePath.HOME }) });
    return;
  }
  uni.switchTab({ url: RoutePath.HOME });
}

function handleComingSoon() {
  uni.showToast({ title: "敬请期待", icon: "none" });
}
</script>

<style lang="scss" scoped>
.login {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 88rpx);
  background-color: $color-bg-page;
}

.login__brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 0 64rpx;
}

.login__brand-name {
  margin-top: $spacing-md;
  font-size: 40rpx;
  font-weight: 900;
  color: $color-text-title;
  letter-spacing: 4rpx;
}

.login__brand-slogan {
  margin-top: $spacing-xs;
  font-size: $font-size-sm;
  color: $color-text-sub;
  letter-spacing: 8rpx;
}

.login__form {
  padding: 0 48rpx;
}

.login__notice {
  display: flex;
  gap: $spacing-sm;
  align-items: center;
  margin-bottom: $spacing-md;
}

.login__notice-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 36rpx;
  height: 36rpx;
  font-size: $font-size-xs;
  font-weight: bold;
  color: $color-text-sub;
  border: 1rpx solid $color-border;
  border-radius: 6rpx;
}

.login__notice > text {
  font-size: $font-size-xs;
  color: $color-text-sub;
}

.login__agreement {
  display: flex;
  gap: $spacing-sm;
  align-items: flex-start;
  margin-bottom: 48rpx;
}

.login__checkbox {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 32rpx;
  height: 32rpx;
  margin-top: 4rpx;
  background-color: $color-bg;
  border: 1rpx solid $color-text-placeholder;
  border-radius: 6rpx;
}

.login__checkbox--checked {
  background-color: $color-primary;
  border-color: $color-primary;
}

.login__agreement-text {
  font-size: $font-size-xs;
  line-height: 1.7;
  color: $color-text-sub;
}

.login__agreement-link {
  color: $color-text-content;
  text-decoration: underline;
}

.login__button {
  height: $height-button;
  margin-bottom: $spacing-md;
  font-size: $font-size-lg;
  font-weight: bold;
  line-height: $height-button;
  text-align: center;
  border-radius: 24rpx;
}

.login__button--primary {
  color: $color-bg;
  background-color: $color-primary;
}

.login__button--plain {
  color: $color-text-title;
  background-color: transparent;
  border: 3rpx solid $color-text-title;
}

.login__photo {
  flex: 1;
  min-height: 320rpx;
  margin-top: $spacing-lg;
  background: linear-gradient(160deg, $color-primary-tint, $color-surface-rose 60%, $color-surface-warm);
}

.login__skip {
  margin-top: $spacing-md;
  font-size: $font-size-md;
  color: $color-text-sub;
  text-align: center;
  text-decoration: underline;
}

.login__hint {
  margin-top: $spacing-xs;
  font-size: $font-size-xs;
  color: $color-text-placeholder;
  text-align: center;
}

.login__bar {
  height: 8rpx;
  margin-top: $spacing-md;
  background-color: $color-primary;
}
</style>
