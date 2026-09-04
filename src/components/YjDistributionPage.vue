<template>
  <YjPage>
    <view class="distribution">
      <view v-if="loading" class="distribution-loading"><wd-loading size="48rpx" /></view>
      <YjEmpty v-else-if="error" :image="denied ? 'content' : 'network'" :text="error">
        <wd-button size="small" plain @click="$emit('retry')">重新加载</wd-button>
      </YjEmpty>
      <!-- 刷新期间隐藏内容但保留滚动组件，避免 H5 onActivated 恢复到已卸载节点。 -->
      <view v-show="!loading && !error">
        <view v-if="disabled" class="distribution-notice"
          >代理身份已停用，可查看历史记录并按规则提取已结算余额。</view
        >
        <slot />
      </view>
    </view>
  </YjPage>
</template>

<script setup lang="ts">
defineProps<{ loading: boolean; error: string; denied?: boolean; disabled?: boolean }>();
defineEmits<{ (e: "retry"): void }>();
</script>

<style lang="scss" src="@/styles/distribution.scss"></style>
