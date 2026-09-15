import { formatTimeDelta } from "~/utils/time";

import type { Locale } from "./locale";

export type DateInput = string | number | Date;

// Absolute timestamps are rendered in UTC (with the designator) so that the
// server render and the browser render agree regardless of their time zones.
export function formatDateTime(value: DateInput, locale: Locale): string {
  return new Date(value).toLocaleString(locale, { timeZone: "UTC", timeZoneName: "short" });
}

export function formatDate(value: DateInput, locale: Locale): string {
  return new Date(value).toLocaleDateString(locale, { timeZone: "UTC" });
}

export function formatShortDate(value: DateInput, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

/** Relative time in the selected language; English keeps the upstream wording. */
export function formatRelativeTime(date: Date, locale: Locale): string {
  if (locale !== "zh-CN") {
    return formatTimeDelta(date);
  }

  const minutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);

  if (minutes < 60) return `${Math.max(0, minutes)} 分钟前`;
  if (hours < 24) return `${hours} 小时${minutes % 60 ? ` ${minutes % 60} 分钟` : ""}前`;
  if (days < 30) return `${days} 天${hours % 24 ? ` ${hours % 24} 小时` : ""}前`;
  return `${months} 个月${days % 30 ? ` ${days % 30} 天` : ""}前`;
}
