# Organization branding

Set these environment variables on the Headplane server/container:

```dotenv
HEADPLANE_ORGANIZATION_NAME='飞捷科思 · Fysics'
HEADPLANE_ORGANIZATION_LOGO_URL='https://assets.example.com/fysics-logo.svg'
```

The name replaces Headplane in the administration header and browser tab. The
logo replaces the H mark beside the name. Values are literal organization data
and do not change when switching language. Neither setting changes account,
organization or OAuth identities. Upstream attribution/documentation is retained.

Both settings are optional. Empty names default to Headplane. An empty, invalid,
or unavailable logo uses the original theme-aware H mark. Logos fit within a
32 × 32 pixel area without stretching; use a square transparent logo that is
readable on light and dark backgrounds. Long names are truncated in the header,
with the full name available on hover.

Use an HTTPS image URL reachable by employees' browsers, or a root-relative URL
such as `/branding/logo.svg` served by your reverse proxy. Root-relative paths
start at the host root, not Headplane's `/admin` prefix. The environment variable
does not upload or serve a local file. HTTP is supported for local testing;
HTTPS deployments should use HTTPS to avoid mixed-content blocking. Protocol-
relative URLs, credentials in URLs, data URLs and executable schemes are ignored.
Images are loaded by the browser with no referrer; Headplane does not fetch them.
Do not put private tokens in public logo URLs.

Pass variables through your deployment environment and recreate the container
after changes. No image rebuild is required to change branding once this version
is installed. For Compose, use `environment` entries on the `headplane` service:

```yaml
environment:
  HEADPLANE_ORGANIZATION_NAME: ${HEADPLANE_ORGANIZATION_NAME:-}
  HEADPLANE_ORGANIZATION_LOGO_URL: ${HEADPLANE_ORGANIZATION_LOGO_URL:-}
```
