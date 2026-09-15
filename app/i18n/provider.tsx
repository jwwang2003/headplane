import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatShortDate,
  type DateInput,
} from "./format";
import { isLocale, localeCookie, type Locale } from "./locale";
import { translate, type Translate } from "./translate";

export interface I18n {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Translates an explicit English source message; see `translate`. */
  t: Translate;
  formatDate: (value: DateInput) => string;
  formatDateTime: (value: DateInput) => string;
  formatShortDate: (value: DateInput) => string;
  formatRelativeTime: (date: Date) => string;
  yesNo: (value: unknown) => string;
}

function createI18n(locale: Locale, setLocale: (locale: Locale) => void): I18n {
  const t: Translate = (message, values) => translate(locale, message, values);
  return {
    locale,
    setLocale,
    t,
    formatDate: (value) => formatDate(value, locale),
    formatDateTime: (value) => formatDateTime(value, locale),
    formatShortDate: (value) => formatShortDate(value, locale),
    formatRelativeTime: (date) => formatRelativeTime(date, locale),
    yesNo: (value) => t(value ? "Yes" : "No"),
  };
}

const I18nContext = createContext<I18n>(createI18n("en", () => {}));

/**
 * The initial locale comes from the request (cookie, then Accept-Language) so
 * the server render and hydration agree. Switching languages persists the
 * cookie, re-renders the tree (portals included) and keeps form state intact.
 */
export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const [locale, updateLocale] = useState(initialLocale);
  const value = useMemo(
    () =>
      createI18n(locale, (next) => {
        if (!isLocale(next)) return;
        const secure = window.location.protocol === "https:" ? "; Secure" : "";
        document.cookie = `${localeCookie}=${next}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
        updateLocale(next);
      }),
    [locale],
  );

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
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

/** Top-right switcher for pages without the application header. */
export function FloatingLanguageSwitcher() {
  return (
    <div className="fixed top-4 right-4 z-50">
      <LanguageSwitcher />
    </div>
  );
}
