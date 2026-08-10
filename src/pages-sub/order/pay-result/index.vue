<template>
  <YjPage>
    <YjPlaceholder
      title="支付结果"
      section="3.5.3"
      :points="[
        '支付成功：订单信息、查看订单、继续购物',
        '支付失败：失败原因、重新支付',
        '轮询 PayAPI.getStatus 确认最终状态',
      ]"
    />
  </YjPage>
</template>
