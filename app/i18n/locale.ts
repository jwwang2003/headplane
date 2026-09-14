export type Locale = "en" | "zh-CN";
export const localeCookie = "headplane_locale";

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "zh-CN";
}

/** A validated preference takes precedence over weighted browser languages. */
export function getLocale(request: Request): Locale {
  const preference = request.headers
    .get("Cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${localeCookie}=`))
    ?.slice(localeCookie.length + 1);
  if (isLocale(preference)) return preference;

  const languages = (request.headers.get("Accept-Language") ?? "")
    .split(",")
    .map((part, order) => {
      const [language, ...parameters] = part.trim().split(";");
      const quality = parameters.find((parameter) => parameter.trim().startsWith("q="));
      return {
        language: language.toLowerCase(),
        weight: quality ? Number(quality.trim().slice(2)) : 1,
        order,
      };
    })
    .filter(({ weight }) => Number.isFinite(weight) && weight > 0 && weight <= 1)
    .sort((a, b) => b.weight - a.weight || a.order - b.order);
  for (const { language } of languages) {
    if (language === "zh" || language.startsWith("zh-")) return "zh-CN";
    if (language === "en" || language.startsWith("en-")) return "en";
  }
  return "en";
}
