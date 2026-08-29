export function remainingSeconds(value: string | Date, now = Date.now()): number {
  const expiresAt = new Date(value).getTime();
  if (!Number.isFinite(expiresAt)) return 0;
  return Math.max(0, Math.ceil((expiresAt - now) / 1000));
}

export function formatCountdown(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = total % 60;
  const clock = [hours, minutes, rest].map((value) => String(value).padStart(2, "0")).join(":");
  return days ? `${days}天 ${clock}` : clock;
}

export function remainingPeople(requiredPeople: number, paidPeople: number): number {
  return Math.max(0, requiredPeople - paidPeople);
}
