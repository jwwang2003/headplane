# Interface language

Headplane supports English and Simplified Chinese (简体中文). Use the language
selector beside the user icon in the top-right administration header. On login
and error pages, the selector appears in the top-right corner. Changing language updates the interface immediately and preserves
open forms and dialogs. The selection is remembered for one year in the
`headplane_locale` preference cookie. Clearing cookies resets this preference.

On your first visit, Headplane uses the browser's preferred supported language,
with English as the fallback. The server reads the same preference before
rendering the page, so the initial page and browser hydration use the same
language. Both translations are included in the application; no external
translation service or identity-provider configuration is required.

The translation covers navigation, login and OIDC notices, machines and routes,
users and roles, DNS, ACL editor controls, authentication keys and restrictions,
agent settings, dialogs, validation messages, notifications, and browser SSH
controls. Absolute dates use the selected language and UTC; date-times display
the UTC designation. Relative times also use the selected language.

Headplane, Headscale, and Tailscale names are preserved. Usernames, device names,
email addresses, tags, domain names, IP addresses, secrets, configuration and ACL
content, commands, terminal output, and raw upstream diagnostic details keep their
original values. Browser-native form validation follows the browser's language.
Unrecognized library and upstream diagnostic messages fall back to their original
text. Documentation links continue to point to the upstream documentation.

## Contributing translations

`app/i18n/zh-CN.ts` contains the explicit Chinese message catalogue, keyed by the
English source text. Render fixed copy with `<T text="English source text" />`;
use `const { t } = useI18n()` for string props and dynamic messages. The provider
is scoped to the React tree and includes portal-rendered dialogs and tooltips.
Do not modify DOM text or apply translation to arbitrary user data.

Use named placeholders for complete dynamic sentences, for example
`t("Showing {shown} of {total} machines", { shown, total })`. Preserve every
placeholder in the translated message. Select singular and plural English
messages based on the count; Chinese messages can share the same phrasing.
Translate static option labels where those options are created, keeping their
submitted values unchanged. Translate stored form errors and notifications when
rendering them so an open message follows a language change.

Run `pnpm run typecheck`, `pnpm run test:unit`, and `pnpm run build` after changes.
The locale unit tests cover preference selection, SSR isolation, English fallback,
interpolation, preservation of dynamic data, and relative time formatting.
