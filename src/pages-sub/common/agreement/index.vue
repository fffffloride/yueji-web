<template>
  <YjPage>
    <view v-if="loading" class="agreement-status">
      <wd-loading />
      <text>正在加载协议</text>
    </view>

    <view v-else-if="error || !agreement" class="agreement-status">
      <YjEmpty image="network" :text="error || '协议暂未发布'">
        <wd-button size="small" type="primary" @click="load">重新加载</wd-button>
      </YjEmpty>
    </view>

    <view v-else class="agreement">
      <view class="agreement__title">{{ agreement.title }}</view>
      <view class="agreement__time">发布时间：{{ formatDate(agreement.publishTime) }}</view>
      <rich-text class="agreement__content" :nodes="agreement.content" />
    </view>
  </YjPage>
</template>

<script setup lang="ts">
import AgreementAPI, { AgreementType, type PublishedAgreement } from "@/api/agreement";
import { formatDate } from "@/utils/format";

const type = ref(AgreementType.USER_AGREEMENT);
const agreement = ref<PublishedAgreement>();
const loading = ref(false);
const error = ref("");

async function load() {
  if (loading.value) return;
  loading.value = true;
  error.value = "";
  try {
    agreement.value = await AgreementAPI.get(type.value);
    uni.setNavigationBarTitle({ title: agreement.value.title });
  } catch (reason) {
    agreement.value = undefined;
    error.value = reason instanceof Error ? reason.message : "协议加载失败";
  } finally {
    loading.value = false;
  }
}

onLoad((options) => {
  type.value =
    options?.type === AgreementType.PRIVACY_POLICY
      ? AgreementType.PRIVACY_POLICY
      : AgreementType.USER_AGREEMENT;
  void load();
});
</script>

<style lang="scss" scoped>
.agreement-status {
  display: flex;
  gap: $spacing-sm;
  align-items: center;
  justify-content: center;
  min-height: 640rpx;
  color: $color-text-sub;
}

.agreement {
  padding-bottom: $spacing-lg;
}

.agreement__title {
  font-size: $font-size-xl;
  font-weight: 700;
  color: $color-text-title;
  text-align: center;
}

.agreement__time {
  margin: $spacing-sm 0 $spacing-lg;
  font-size: $font-size-xs;
  color: $color-text-placeholder;
  text-align: center;
}

.agreement__content {
  font-size: $font-size-md;
  line-height: 1.8;
  color: $color-text-content;
  overflow-wrap: anywhere;
}
</style>
