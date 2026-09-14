import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi, afterEach } from "vitest";

import { getLocale, isLocale } from "~/i18n/locale";
import { translate } from "~/i18n/messages";
import { I18nProvider, LanguageSwitcher, T } from "~/i18n/provider";
import { zhCN } from "~/i18n/zh-CN";
import { formatTimeDelta } from "~/utils/time";

function request(headers: HeadersInit = {}) {
  return new Request("https://example.com/admin/login", { headers });
}

describe("locale preference", () => {
  it("prefers a valid persistent cookie over browser language", () => {
    expect(
      getLocale(
        request({ Cookie: "session=abc; headplane_locale=zh-CN", "Accept-Language": "en-US" }),
      ),
    ).toBe("zh-CN");
    expect(getLocale(request({ Cookie: "headplane_locale=en", "Accept-Language": "zh-CN" }))).toBe(
      "en",
    );
  });
  it("negotiates weighted supported languages and handles malformed preferences", () => {
    expect(getLocale(request({ "Accept-Language": "fr,zh-TW;q=0.9,en;q=0.5" }))).toBe("zh-CN");
    expect(getLocale(request({ "Accept-Language": "zh;q=0,en-US;q=0.5" }))).toBe("en");
    expect(
      getLocale(
        request({
          Cookie: "headplane_locale=%3Cscript%3E",
          "Accept-Language": "zh-CN;q=no,en;q=0.5",
        }),
      ),
    ).toBe("en");
    expect(getLocale(request())).toBe("en");
    expect(isLocale("zh")).toBe(false);
  });
});

describe("explicit message translation", () => {
  it("preserves unknown messages including inherited object property names", () => {
    for (const message of ["upstream diagnostic", "constructor", "toString", "__proto__"]) {
      expect(translate("zh-CN", message)).toBe(message);
      expect(translate("zh-CN", message, { name: "value" })).toBe(message);
    }
  });
  it("interpolates dynamic values verbatim and handles both count forms", () => {
    const name = "Admin <script> $& {count}";
    expect(translate("zh-CN", "Copied {name} to clipboard", { name })).toBe(
      `已将${name}复制到剪贴板`,
    );
    expect(translate("en", "{count} machine", { count: 1 })).toBe("1 machine");
    expect(translate("zh-CN", "{count} machines", { count: 2 })).toBe("2 台设备");
  });
  it("keeps every translated message's interpolation placeholders", () => {
    for (const [english, chinese] of Object.entries(zhCN)) {
      expect(chinese.match(/\{\w+\}/g)?.sort() ?? [], english).toEqual(
        english.match(/\{\w+\}/g)?.sort() ?? [],
      );
    }
  });
  it("renders isolated SSR locales without translating user data or commands", () => {
    function render(initialLocale: "en" | "zh-CN") {
      return renderToStaticMarkup(
        createElement(I18nProvider, {
          initialLocale,
          children: createElement(
            "main",
            null,
            createElement(T, { text: "Machines" }),
            createElement("span", null, "Admin"),
            createElement("code", null, "headscale apikeys create"),
            createElement(LanguageSwitcher),
          ),
        }),
      );
    }
    expect(render("zh-CN")).toContain("设备");
    expect(render("zh-CN")).toContain("<span>Admin</span>");
    expect(render("zh-CN")).toMatch(/<option[^>]*value="zh-CN"[^>]*selected=""/);
    expect(render("en")).toContain("Machines");
    expect(render("en")).not.toContain("设备");
    expect(render("zh-CN")).toContain("headscale apikeys create");
  });
});

describe("relative times", () => {
  afterEach(() => vi.useRealTimers());
  it("formats days/hours in both languages", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-14T12:00:00Z"));
    const date = new Date("2026-09-13T10:00:00Z");
    expect(formatTimeDelta(date, "en")).toBe("1 day, 2 hours ago");
    expect(formatTimeDelta(date, "zh-CN")).toBe("1 天 2 小时前");
  });
});
