import type { MetaFunction } from "react-router";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  unstable_useRoute as useRoute,
  useMatches,
} from "react-router";

import { OrganizationTitle } from "~/components/organization-brand";
import { FloatingLanguageSwitcher, getLocale, I18nProvider } from "~/i18n";
import { getOrganizationBranding } from "~/server/branding.server";
import { LiveDataProvider } from "~/utils/live-data";
import ToastProvider from "~/utils/toast-provider";

import type { Route } from "./+types/root";
import { ErrorBanner } from "./components/error-banner";

import "@fontsource-variable/inter/opsz.css";
import "./tailwind.css";
import { getColorScheme } from "./utils/color-scheme";

export const meta: MetaFunction = () => [
  {
    name: "description",
    content: "A frontend for the headscale coordination server",
  },
];

export async function loader({ request }: Route.LoaderArgs) {
  const colorScheme = await getColorScheme(request);
  return { colorScheme, locale: getLocale(request), branding: getOrganizationBranding() };
}

export function Layout({ children }: { readonly children: React.ReactNode }) {
  const { loaderData } = useRoute("root");
  const hasAppLayout = useMatches().some((match) => match.id === "layout/app");

  // LiveDataProvider is wrapped at the top level since dialogs and things
  // that control its state are usually open in portal containers which
  // are not a part of the normal React tree.
  return (
    <LiveDataProvider>
      <html
        lang={loaderData?.locale ?? "en"}
        className={
          loaderData?.colorScheme === "dark"
            ? "dark"
            : loaderData?.colorScheme === "light"
              ? "light"
              : ""
        }
      >
        <head>
          <meta charSet="utf-8" />
          <meta content="width=device-width, initial-scale=1" name="viewport" />
          <Meta />
          <Links />
          <link href={`${__PREFIX__}/favicon.ico`} rel="icon" />
        </head>
        <body className="w-full overflow-x-hidden overscroll-none dark:bg-mist-900 dark:text-mist-50">
          <I18nProvider initialLocale={loaderData?.locale ?? "en"}>
            <OrganizationTitle branding={loaderData?.branding} />
            {children}
            {!hasAppLayout && <FloatingLanguageSwitcher />}
            <ToastProvider />
          </I18nProvider>
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    </LiveDataProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const hasAppLayout = useMatches().some((match) => match.id === "layout/app");
  return (
    <div className="flex h-screen w-screen items-center justify-center p-4">
      {hasAppLayout && <FloatingLanguageSwitcher />}
      <ErrorBanner className="max-w-2xl" error={error} />
    </div>
  );
}

export default function App() {
  return <Outlet />;
}
