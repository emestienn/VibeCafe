export type OpeningHours = Record<string, { open: string; close: string }>;

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export function isOpenNow(hours: unknown, now: Date = new Date()): boolean {
  if (!hours || typeof hours !== "object") return true;
  const today = DAY_KEYS[now.getDay()];
  const entry = (hours as OpeningHours)[today];
  if (!entry) return true;

  const [openH, openM] = entry.open.split(":").map(Number);
  const [closeH, closeM] = entry.close.split(":").map(Number);
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  if (closeMinutes <= openMinutes) {
    // overnight / 24h window
    return minutesNow >= openMinutes || minutesNow < closeMinutes;
  }
  return minutesNow >= openMinutes && minutesNow < closeMinutes;
}

export function formatHoursToday(hours: unknown, now: Date = new Date()): string {
  if (!hours || typeof hours !== "object") return "Hours vary";
  const today = DAY_KEYS[now.getDay()];
  const entry = (hours as OpeningHours)[today];
  if (!entry) return "Hours vary";
  if (entry.open === "00:00" && entry.close === "23:59") return "Open 24 hours";
  return `${entry.open} – ${entry.close}`;
}
