/** Public presentation settings only; never serialize the process environment. */
export function getOrganizationBranding(env: NodeJS.ProcessEnv = process.env) {
  const name = env.HEADPLANE_ORGANIZATION_NAME?.trim() || "Headplane";
  const candidate = env.HEADPLANE_ORGANIZATION_LOGO_URL?.trim();
  let logoUrl: string | undefined;
  if (candidate && !/[\\\s\u0000-\u001f\u007f]/u.test(candidate)) {
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
  return { name, logoUrl };
}
