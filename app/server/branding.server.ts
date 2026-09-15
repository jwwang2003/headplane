/** Public presentation settings only; never serialize the process environment. */
export function getOrganizationBranding(env: NodeJS.ProcessEnv = process.env) {
  const name = env.HEADPLANE_ORGANIZATION_NAME?.trim() || "Headplane";
  const candidate = env.HEADPLANE_ORGANIZATION_LOGO_URL?.trim();
  let logoUrl: string | undefined;
  if (candidate && isPlainUrlText(candidate)) {
    if (candidate.startsWith("/") && !candidate.startsWith("//")) {
      logoUrl = candidate;
    } else {
      try {
        const url = new URL(candidate);
        if (["http:", "https:"].includes(url.protocol) && !url.username && !url.password) {
          logoUrl = url.href;
        }
      } catch {
        // Invalid URLs use the upstream logo.
      }
    }
  }
  return {
    name,
    logoUrl,
    ...(env.HEADPLANE_ORGANIZATION_NAME_EN?.trim()
      ? { nameEn: env.HEADPLANE_ORGANIZATION_NAME_EN.trim() }
      : {}),
    ...(env.HEADPLANE_ORGANIZATION_NAME_ZH?.trim()
      ? { nameZh: env.HEADPLANE_ORGANIZATION_NAME_ZH.trim() }
      : {}),
  };
}

/** Rejects backslashes, whitespace and control characters before URL parsing. */
function isPlainUrlText(value: string) {
  if (/[\\\s]/.test(value)) return false;
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    if (code < 0x20 || code === 0x7f) return false;
  }
  return true;
}
