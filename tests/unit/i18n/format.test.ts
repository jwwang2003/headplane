import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { formatDate, formatDateTime, formatRelativeTime, formatShortDate } from "~/i18n/format";
import { I18nProvider, useI18n } from "~/i18n/provider";
import { formatTimeDelta } from "~/utils/time";

const instant = "2026-09-13T10:05:00Z";

describe("absolute dates", () => {
  it("renders in the selected language and in UTC regardless of the host time zone", () => {
    expect(formatDateTime(instant, "en")).toBe("9/13/2026, 10:05:00 AM UTC");
    expect(formatDateTime(instant, "zh-CN")).toBe("2026/9/13 UTC 10:05:00");
    expect(formatDate(instant, "en")).toBe("9/13/2026");
    expect(formatDate(instant, "zh-CN")).toBe("2026/9/13");
    expect(formatShortDate(instant, "en")).toBe("Sep 13, 2026");
    expect(formatShortDate(instant, "zh-CN")).toBe("2026年9月13日");
  });

  it("accepts the same inputs as the Date constructor", () => {
    expect(formatDate(new Date(instant), "en")).toBe(formatDate(instant, "en"));
    expect(formatDate(Date.parse(instant), "en")).toBe(formatDate(instant, "en"));
  });
});

describe("relative times", () => {
  afterEach(() => vi.useRealTimers());

  it("formats in both languages and keeps the upstream English wording", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-14T12:00:00Z"));
    const date = new Date("2026-09-13T10:00:00Z");
    expect(formatRelativeTime(date, "en")).toBe(formatTimeDelta(date));
    expect(formatRelativeTime(date, "en")).toBe("1 day, 2 hours ago");
    expect(formatRelativeTime(date, "zh-CN")).toBe("1 天 2 小时前");
    expect(formatRelativeTime(new Date("2026-09-14T11:15:00Z"), "zh-CN")).toBe("45 分钟前");
    expect(formatRelativeTime(new Date("2026-06-01T12:00:00Z"), "zh-CN")).toBe("3 个月 15 天前");
  });
});

describe("hook helpers", () => {
  function Probe() {
    const { yesNo, formatDate: date } = useI18n();
    return `${yesNo(true)}/${yesNo(undefined)}/${date(instant)}`;
  }

  it("bind the current locale", () => {
    const render = (initialLocale: "en" | "zh-CN") =>
      renderToStaticMarkup(
        createElement(I18nProvider, { initialLocale, children: createElement(Probe) }),
      );
    expect(render("en")).toBe("Yes/No/9/13/2026");
    expect(render("zh-CN")).toBe("是/否/2026/9/13");
  });
});
