/**
 * 把以「分」为单位的金额格式化为「元」。
 *
 * 后端金额统一用整数分传输，避免浮点误差。
 *
 * @param cents - 金额（分）。
 * @param withSymbol - 是否带 ¥ 符号，默认 false。
 * @returns 形如 "199.00" 或 "¥199.00" 的字符串。
 */
export function formatPrice(cents: number, withSymbol = false): string {
  const yuan = (Number(cents || 0) / 100).toFixed(2);
  return withSymbol ? `¥${yuan}` : yuan;
}

/**
 * 格式化时间。
 *
 * @param value - 时间戳、日期字符串或 Date 对象。
 * @param pattern - 输出模板，支持 YYYY MM DD HH mm ss，默认 "YYYY-MM-DD HH:mm"。
 * @returns 格式化后的字符串，输入非法时返回空串。
 */
export function formatDate(
  value: number | string | Date,
  pattern = "YYYY-MM-DD HH:mm"
): string {
  if (!value) return "";
  // iOS 不识别 "2024-01-01 10:00" 这种带空格的格式，需要先转成 ISO 风格
  const normalized = typeof value === "string" ? value.replace(/-/g, "/") : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");
  return pattern
    .replace("YYYY", String(date.getFullYear()))
    .replace("MM", pad(date.getMonth() + 1))
    .replace("DD", pad(date.getDate()))
    .replace("HH", pad(date.getHours()))
    .replace("mm", pad(date.getMinutes()))
    .replace("ss", pad(date.getSeconds()));
}

/** 手机号中间四位脱敏。 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 11) return phone || "";
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}

/**
 * 把查询参数拼接到 url 上，自动跳过 undefined / null / 空串。
 *
 * 入参用 object 而非 Record<string, unknown>，否则 interface 定义的参数类型
 * 因缺少索引签名无法通过校验。
 */
export function buildQuery(params?: object): string {
  if (!params) return "";
  const pairs = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  return pairs.length ? `?${pairs.join("&")}` : "";
}
