/**
 * 商品详情页静态数据（还原设计稿阶段使用，后续替换为真实接口）。
 */

/** 详情页胶囊 Tab。 */
export const detailTabs: string[] = [
  "品项介绍",
  "品项亮点",
  "产品对比",
  "品项价值",
  "适用人群",
  "正品验真",
  "治疗介绍",
  "联合治疗",
  "术后贴士",
];

/** 治疗数据四宫格。 */
export interface TreatmentStat {
  label: string;
  value: string;
}

export const treatmentStats: TreatmentStat[] = [
  { label: "治疗时间", value: "20-60分钟" },
  { label: "痛感", value: "轻微" },
  { label: "恢复期", value: "基本无恢复期" },
  { label: "效果维持", value: "3-5年" },
];

/** 效果图展示区下方的门店注脚。 */
export const detailPhotoCaption = {
  store: "◎ 悦己轻医美(北京丽泽天街店) No.022",
  meta: "操作师：陈秀娜　　16天前",
};

/** 品项介绍正文（name 为商品名）。 */
export function introText(name: string): string {
  return `InMode${name}，来自以色列的盈美特医疗公司，属于塑形的射频治疗仪，利用射频热作用以及纳秒级超高压脉冲波，在对温度的严格把控下，定向对表皮、真皮、脂肪层进行弹性管理，减少脂肪细胞数量，达到塑形美体效果。`;
}

/** 品项亮点正文。 */
export function highlightText(name: string): string[] {
  return [
    `【${name}】亮点优势`,
    `${name}具备脂肪管理和双模式两大亮点：`,
    "1.脂肪管理",
    "双重能量，第一层是射频，第二层是电击穿。电击穿作用能真正使脂肪细胞凋亡，达到减少细胞数量的效果；",
    "2.双模式+双治疗头",
    "负压吸头，精准处理：将脂肪组织吸附到5厘米宽的凹槽，射频+电击穿从两侧释放能量，处理精细部位脂肪效果更好。",
  ];
}

/** 术后贴士条目。 */
export const postCareTips: string[] = [
  "面部术后3~5天，建议敷常温补水面膜。",
  "身体术后3~5天，需涂抹身体乳液或其他保湿产品。",
  "术后建议使用温水清洁治疗区域（避免接触热水）。",
  "术后一周内避免蒸桑拿泡温泉等。",
  "术后每天饮6~8杯（300ml/杯）温水，治疗区域做好防晒，避免对治疗部位的摩擦。",
  "注意饮食，避免暴饮暴食；可适当运动加速代谢。",
  "治疗后，有任何情况，随时联系客服。",
];

/** 适用门店。 */
export interface DetailStore {
  address: string;
  distance: string;
}

export const detailStores: DetailStore[] = [
  { address: "上海市浦东新区沪南路2229号夏地活力城北区L5层L5018、L5019", distance: "24.74km" },
];

/** 购买须知。 */
export const purchaseNotes = [
  { title: "项目适用城市与服务机构", text: "适用城市及服务机构以订单页面展示的可选适用门店为准。" },
  { title: "预约信息", text: "1.您可于下单时选择预约服务时间与服务机构，如遭遇疫情等不可抗力原因或参与会员超出机构最大承载量的，工作人员将根据情况同您重新协调实际到店体验时间。\n2.预约日历为阶段性开放，请关注上订单页面日历更新，以订单展示的可预约日期/时间为准，并请您在对应的核销时间内至指定机构接受服务。\n3.为保证您的服务体验，请您至少提前1天完成预约。" },
];
