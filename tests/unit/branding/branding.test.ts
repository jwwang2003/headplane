import { describe, expect, it } from "vitest";

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
