# Interface language

Headplane supports English and Simplified Chinese (简体中文). Use the language
selector beside the user icon in the top-right administration header. On login
and error pages, the selector appears in the top-right corner. Changing language
updates the interface immediately and preserves open forms and dialogs. The
selection is remembered for one year in the `headplane_locale` preference
cookie. Clearing cookies resets this preference.

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

Everything lives in `app/i18n`:

- `locale.ts` negotiates the locale from the request (cookie, then
  `Accept-Language`).
- `translate.ts` looks up a message in the catalogue and fills `{name}`
  placeholders.
- `format.ts` formats absolute dates (UTC) and relative times for a locale.
- `provider.tsx` provides `useI18n()` (`t`, `locale`, `formatDate`,
  `formatDateTime`, `formatShortDate`, `formatRelativeTime`, `yesNo`) and the
  language switcher controls.
- `zh-CN.ts` is the Simplified Chinese catalogue, keyed by the English source
  text.

Render copy with `const { t } = useI18n()` and `t("English source text")`. Use
named placeholders for complete dynamic sentences, for example
`t("Showing {shown} of {total} machines", { shown, total })`, and keep every
placeholder in the translated message. Helpers that are not components receive
`t` as a parameter instead of calling the hook. Never translate user data, and
never rewrite DOM text.

The shared components translate their own copy-only props, so a route does not
repeat the call for them: `Attribute` (`name`, `tooltip`), `Input` (`label`,
`description`, `errorMessage`), `Select` and `NumberInput` (`label`,
`description`), `Switch`, `RadioGroup` and `Tabs` (`label`), `Notice` and
`StatusBanner` (`title`), `PageError` (`page`) and `Tooltip` (string `content`).
Children, values, option items and placeholders are never translated by a
component; translate copy placeholders explicitly and leave example placeholders
such as `example.com` alone. Translate static option labels where the options are
created, keeping their submitted values unchanged. Server responses, toasts and
stored form errors are translated when rendered, so an open message follows a
language change.

`tests/unit/i18n/coverage.test.ts` keeps the catalogue honest. It scans `app/`
for `t("...")` calls, for the props listed above and for `label:`/`desc:`
literals, and fails when a translated message has no zh-CN entry. It also fails
when an entry no longer matches any string literal in `app/`, which is what an
upstream wording change looks like, so upstream changes cannot silently fall
back to English. Identifiers that pass through a translated prop (`IPv6`,
`AAAA`) and product names (`Magic DNS`, `Tailscale SSH`) have identity entries.
When retiring a translated screen, the report lists exactly the entries to
remove.

Run `pnpm run typecheck`, `pnpm run test:unit`, and `pnpm run build` after
changes. The i18n unit tests cover preference selection, SSR isolation, English
fallback, interpolation, preservation of dynamic data, date formatting and
catalogue coverage.
