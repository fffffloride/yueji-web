<template>
  <view class="page">
    <view
      class="page__body"
      :class="{
        'page__body--no-padding': !padded,
        'page__body--with-footer': hasFooter,
        'page__body--with-tabbar': !!tabbar,
      }"
    >
      <slot />
    </view>

    <view
      v-if="$slots.footer"
      class="page__footer"
      :class="{ 'page__footer--with-tabbar': !!tabbar }"
    >
      <slot name="footer" />
    </view>

    <YjTabBar v-if="tabbar" :current="tabbar" />
  </view>
</template>

<script setup lang="ts">
/** 页面容器，统一处理页面留白、底部固定栏占位与自定义 TabBar。 */
withDefaults(
  defineProps<{
    /** 传入 RoutePath 中的 TabBar 路径即渲染自定义底部导航 */
    tabbar?: string;
    /** 页面是否有底部固定操作栏，用于给内容区留出占位 */
    hasFooter?: boolean;
    /** 是否使用默认的左右留白，纯图页面可关掉 */
    padded?: boolean;
  }>(),
  { tabbar: "", hasFooter: false, padded: true }
);
</script>

<style lang="scss" scoped>
.page__body--no-padding {
  padding-right: 0;
  padding-left: 0;
}

.page__body--with-footer.page__body--with-tabbar {
  padding-bottom: calc(#{$height-button} + #{$height-tabbar} + #{$spacing-lg});
}

.page__footer--with-tabbar {
  bottom: $height-tabbar;
}
</style>
