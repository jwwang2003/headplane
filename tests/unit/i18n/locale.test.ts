import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { getLocale, isLocale, type Locale } from "~/i18n/locale";
import { I18nProvider, LanguageSwitcher, useI18n } from "~/i18n/provider";
import { translate } from "~/i18n/translate";
import { zhCN } from "~/i18n/zh-CN";

function request(headers: HeadersInit = {}) {
  return new Request("https://example.com/admin/login", { headers });
}

describe("locale negotiation", () => {
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
    expect(getLocale(request({ "Accept-Language": "zh-Hans-CN" }))).toBe("zh-CN");
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

  it("uses the same negotiation for the document language and the provider", () => {
    // The root loader passes getLocale(request) both to <html lang> and to the
    // provider, so a zh-CN cookie yields zh-CN markup on the server and the
    // client hydrates with the same initial state.
    const locale = getLocale(request({ Cookie: "headplane_locale=zh-CN" }));
    expect(render(locale)).toContain("设备");
  });
});

describe("explicit message translation", () => {
  it("preserves unknown messages including inherited object property names", () => {
    for (const message of ["upstream diagnostic", "constructor", "toString", "__proto__"]) {
      expect(translate("zh-CN", message)).toBe(message);
      expect(translate("zh-CN", message, { name: "value" })).toBe(message);
    }
  });

  it("interpolates dynamic values verbatim", () => {
    const name = "Admin <script> $& {count}";
    expect(translate("zh-CN", "Copied {name} to clipboard", { name })).toBe(
      `已将${name}复制到剪贴板`,
    );
    expect(translate("en", "Copied {name} to clipboard", { name: "Node key" })).toBe(
      "Copied Node key to clipboard",
    );
    expect(translate("zh-CN", "{count} machines", { count: 2 })).toBe("2 台设备");
    expect(translate("en", "Error {status}", {})).toBe("Error {status}");
  });

  it("matches messages regardless of source whitespace", () => {
    expect(translate("zh-CN", "  Click   to\n copy ")).toBe("点击复制");
  });

  it("keeps every translated message's interpolation placeholders", () => {
    for (const [english, chinese] of Object.entries(zhCN)) {
      expect(chinese.match(/\{\w+\}/g)?.sort() ?? [], english).toEqual(
        english.match(/\{\w+\}/g)?.sort() ?? [],
      );
    }
  });
});

function Machines() {
  return useI18n().t("Machines");
}

function render(initialLocale: Locale) {
  return renderToStaticMarkup(
    createElement(I18nProvider, {
      initialLocale,
      children: createElement(
        "main",
        null,
        createElement(Machines),
        createElement("span", null, "Admin"),
        createElement("code", null, "headscale apikeys create"),
        createElement(LanguageSwitcher),
      ),
    }),
  );
}

describe("provider", () => {
  it("renders isolated SSR locales without translating user data or commands", () => {
    expect(render("zh-CN")).toContain("设备");
    expect(render("zh-CN")).toContain("<span>Admin</span>");
    expect(render("zh-CN")).toContain("headscale apikeys create");
    expect(render("zh-CN")).toMatch(/<option[^>]*value="zh-CN"[^>]*selected=""/);
    expect(render("en")).toContain("Machines");
    expect(render("en")).not.toContain("设备");
    expect(render("en")).toMatch(/<option[^>]*value="en"[^>]*selected=""/);
  });
});
