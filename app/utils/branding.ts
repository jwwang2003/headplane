import type { Locale } from "~/i18n/locale";

export function organizationName(
  branding: { name?: string; nameEn?: string; nameZh?: string } | undefined,
  locale: Locale,
) {
  return (
    (locale === "zh-CN" ? branding?.nameZh : branding?.nameEn) || branding?.name || "Headplane"
  );
}
