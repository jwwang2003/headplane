import type { Locale } from "./locale";
import { zhCN } from "./zh-CN";

export function translate(
  locale: Locale,
  message: string,
  values?: Record<string, string | number>,
): string {
  const normalized = message.replace(/\s+/g, " ").trim();
  const translated =
    locale === "zh-CN" ? (Object.hasOwn(zhCN, normalized) ? zhCN[normalized] : message) : message;
  return values
    ? translated.replace(/\{(\w+)\}/g, (match, name: string) =>
        Object.hasOwn(values, name) ? String(values[name]) : match,
      )
    : translated;
}
