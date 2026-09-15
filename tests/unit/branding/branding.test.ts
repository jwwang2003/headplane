import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { OrganizationTitle, organizationName } from "~/components/organization-brand";
import { I18nProvider } from "~/i18n";
import { getOrganizationBranding } from "~/server/branding.server";

describe("public organization branding", () => {
  it("keeps defaults and does not expose unrelated environment secrets", () => {
    expect(getOrganizationBranding({ OIDC_SECRET: "private" })).toEqual({
      name: "Headplane",
      logoUrl: undefined,
    });
  });

  it("retains Unicode names and accepts HTTPS or root-relative image URLs", () => {
    expect(
      getOrganizationBranding({
        HEADPLANE_ORGANIZATION_NAME: " 飞捷科思 · Fysics ",
        HEADPLANE_ORGANIZATION_LOGO_URL: "https://example.com/logo.svg",
      }),
    ).toEqual({ name: "飞捷科思 · Fysics", logoUrl: "https://example.com/logo.svg" });
    expect(
      getOrganizationBranding({ HEADPLANE_ORGANIZATION_LOGO_URL: "/branding/logo.png" }).logoUrl,
    ).toBe("/branding/logo.png");
  });

  it("rejects executable, credential-bearing, protocol-relative and malformed URLs", () => {
    for (const logo of [
      "javascript:alert(1)",
      "data:image/svg+xml,anything",
      "//example.com/logo",
      "/\\example.com/logo",
      "https://secret:password@example.com/logo",
      "not a URL",
      "https://example.com/\nlogo",
    ]) {
      expect(
        getOrganizationBranding({ HEADPLANE_ORGANIZATION_LOGO_URL: logo }).logoUrl,
      ).toBeUndefined();
    }
  });
});

describe("organization names", () => {
  it("select explicit localized names while retaining the shared fallback", () => {
    const branding = getOrganizationBranding({
      HEADPLANE_ORGANIZATION_NAME: "Company",
      HEADPLANE_ORGANIZATION_NAME_EN: "Headplane Fysics",
      HEADPLANE_ORGANIZATION_NAME_ZH: "Headplane 飞捷科思",
    });
    expect(organizationName(branding, "en")).toBe("Headplane Fysics");
    expect(organizationName(branding, "zh-CN")).toBe("Headplane 飞捷科思");
    expect(
      organizationName(
        getOrganizationBranding({ HEADPLANE_ORGANIZATION_NAME: "Company" }),
        "zh-CN",
      ),
    ).toBe("Company");
    expect(organizationName(undefined, "en")).toBe("Headplane");
  });

  it("render the document title for the current language and hoist it into <head>", () => {
    const branding = getOrganizationBranding({ HEADPLANE_ORGANIZATION_NAME_ZH: "飞捷科思" });
    const html = renderToStaticMarkup(
      createElement(I18nProvider, {
        initialLocale: "zh-CN",
        children: createElement(
          "html",
          null,
          createElement("head", null),
          createElement("body", null, createElement(OrganizationTitle, { branding })),
        ),
      }),
    );
    expect(html).toMatch(/<head><title>飞捷科思<\/title><\/head><body><\/body>/);
  });
});
