import { useState } from "react";
import { unstable_useRoute as useRoute } from "react-router";

import { useI18n, type Locale } from "~/i18n";
import logoBg from "~/logo/dark-bg.svg";
import logoDark from "~/logo/dark.svg";
import logoLight from "~/logo/light.svg";

export interface OrganizationBranding {
  name?: string;
  nameEn?: string;
  nameZh?: string;
  logoUrl?: string;
}

/** The name for the selected language, then the shared name, then Headplane. */
export function organizationName(branding: OrganizationBranding | undefined, locale: Locale) {
  return (
    (locale === "zh-CN" ? branding?.nameZh : branding?.nameEn) || branding?.name || "Headplane"
  );
}

/**
 * Header mark and name. A configured logo is used while it loads; if the
 * browser cannot load it the theme-aware Headplane mark is shown instead.
 */
export function OrganizationBrand() {
  const { locale } = useI18n();
  const branding = useRoute("root")?.loaderData?.branding;
  const name = organizationName(branding, locale);
  const [failedLogo, setFailedLogo] = useState<string>();
  const customLogo =
    branding?.logoUrl && failedLogo !== branding.logoUrl ? branding.logoUrl : undefined;

  return (
    <div className="flex min-w-0 items-center gap-x-2">
      {customLogo ? (
        <img
          src={customLogo}
          alt={`${name} logo`}
          className="size-8 shrink-0 object-contain"
          referrerPolicy="no-referrer"
          onError={() => setFailedLogo(customLogo)}
        />
      ) : (
        <picture className="min-w-8 shrink-0">
          <source srcSet={logoLight} media="(prefers-color-scheme: dark)" />
          <source srcSet={logoDark} media="(prefers-color-scheme: light)" />
          <img src={logoBg} alt="Headplane logo" />
        </picture>
      )}
      <h1 className="max-w-36 truncate text-2xl font-semibold lg:max-w-64" title={name}>
        {name}
      </h1>
    </div>
  );
}

/** Document title in the selected language; React hoists it into <head>. */
export function OrganizationTitle({ branding }: { branding?: OrganizationBranding }) {
  const { locale } = useI18n();
  return <title>{organizationName(branding, locale)}</title>;
}
