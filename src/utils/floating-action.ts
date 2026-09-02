/** 把悬浮按钮吸附到最近的左右边缘，并保留安全边距。 */
export function snapToHorizontalEdge(x: number, maxX: number, margin = 0): number {
  const boundary = Math.max(0, maxX);
  const edge = Math.min(Math.max(0, margin), boundary / 2);
  return x <= boundary / 2 ? edge : boundary - edge;
}
