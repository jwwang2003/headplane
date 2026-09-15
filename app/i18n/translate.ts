import type { Locale } from "./locale";
import { zhCN } from "./zh-CN";

export type Values = Record<string, string | number>;
export type Translate = (message: string, values?: Values) => string;

/**
 * Looks up an English source message in the catalogue for `locale` and fills
 * `{name}` placeholders verbatim. Unknown messages (including runtime data that
 * is passed through by mistake) are returned unchanged, so nothing is ever
 * rewritten except an explicit catalogue hit.
 */
export function translate(locale: Locale, message: string, values?: Values): string {
  const normalized = message.replace(/\s+/g, " ").trim();
  const translated =
    locale === "zh-CN" && Object.hasOwn(zhCN, normalized) ? zhCN[normalized] : message;
  return values
    ? translated.replace(/\{(\w+)\}/g, (match, name: string) =>
        Object.hasOwn(values, name) ? String(values[name]) : match,
      )
    : translated;
}
