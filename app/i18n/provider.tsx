import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { isLocale, localeCookie, type Locale } from "./locale";
import { translate } from "./messages";

type I18n = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (message: string, values?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18n>({
  locale: "en",
  setLocale: () => {},
  t: (message) => message,
});

/** Request-scoped initial state keeps SSR and hydration identical, including portals. */
export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const [locale, updateLocale] = useState(initialLocale);
  const value = useMemo<I18n>(
    () => ({
      locale,
      setLocale(next) {
        if (!isLocale(next)) return;
        document.cookie = `${localeCookie}=${next}; Path=/; Max-Age=31536000; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
        updateLocale(next);
      },
      t: (message, values) => translate(locale, message, values),
    }),
    [locale],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

/** Explicit source message: never walk or rewrite the DOM or translate user data. */
export function T({ text, values }: { text: string; values?: Record<string, string | number> }) {
  return useI18n().t(text, values);
}

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  return (
    <select
      aria-label="Language / 语言"
      value={locale}
      onChange={(event) => {
        if (isLocale(event.target.value)) setLocale(event.target.value);
      }}
      className="rounded-md border border-mist-300 bg-white px-2 py-1.5 text-sm text-mist-800 shadow-sm dark:border-mist-700 dark:bg-mist-900 dark:text-mist-100"
    >
      <option value="en" lang="en">
        English
      </option>
      <option value="zh-CN" lang="zh-CN">
        简体中文
      </option>
    </select>
  );
}
