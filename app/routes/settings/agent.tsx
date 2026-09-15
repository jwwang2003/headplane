import { useFetcher } from "react-router";

import Button from "~/components/button";
import Link from "~/components/link";
import Notice from "~/components/notice";
import StatusCircle from "~/components/status-circle";
import Text from "~/components/text";
import Title from "~/components/title";
import { useI18n } from "~/i18n";
import { agentsContext, authContext } from "~/server/context";

import type { Route } from "./+types/agent";

export async function loader({ request, context }: Route.LoaderArgs) {
  const agents = context.get(agentsContext);
  const auth = context.get(authContext);

  await auth.require(request);

  if (agents.state !== "enabled") {
    return { enabled: false as const, reason: agents.reason };
  }

  const sync = agents.value.lastSync();
  return {
    enabled: true as const,
    syncedAt: sync.syncedAt?.toISOString() ?? null,
    nodeCount: sync.nodeCount,
    error: sync.error,
    authUrl: sync.authUrl,
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const agents = context.get(agentsContext);
  const auth = context.get(authContext);

  await auth.require(request);

  if (agents.state !== "enabled") {
    return { success: false, error: agents.reason };
  }

  await agents.value.triggerSync();
  const sync = agents.value.lastSync();
  return {
    success: !sync.error,
    error: sync.error,
    authUrl: sync.authUrl,
  };
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher<typeof action>();
  const { t, formatRelativeTime } = useI18n();
  const isSyncing = fetcher.state !== "idle";

  if (!loaderData.enabled) {
    return (
      <div className="flex max-w-(--breakpoint-lg) flex-col gap-8">
        <Title>{t("Headplane Agent")}</Title>
        <Notice title="Agent Not Enabled">
          {loaderData.reason}
          {t(". To learn how to set up the agent, visit the")}{" "}
          <Link external styled to="https://headplane.net/features/agent">
            {t("documentation")}
          </Link>
        </Notice>
      </div>
    );
  }

  const isPending = !loaderData.syncedAt && loaderData.authUrl;
  const hasError = Boolean(loaderData.error);

  return (
    <div className="flex max-w-(--breakpoint-lg) flex-col gap-8">
      <div className="flex w-full flex-col sm:w-2/3">
        <Title>{t("Headplane Agent")}</Title>
        <Text>
          {t(
            "The Headplane Agent syncs node information like OS version and connectivity details from your Tailnet.",
          )}
        </Text>
      </div>

      <div className="flex items-center gap-3">
        <StatusCircle isOnline={!hasError && !isPending} className="h-5 w-5" />
        <span className="text-lg font-medium">
          {hasError ? t("Error") : isPending ? t("Waiting for approval") : t("Healthy")}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <Text>
          <span className="font-medium">{t("Last synced:")} </span>
          {loaderData.syncedAt ? (
            <span suppressHydrationWarning>
              {formatRelativeTime(new Date(loaderData.syncedAt))}
            </span>
          ) : (
            t("Never")
          )}
        </Text>
        <Text>
          <span className="font-medium">{t("Nodes synced:")} </span>
          {loaderData.nodeCount}
        </Text>
      </div>

      {isPending ? (
        <Notice variant="warning" title="Agent Needs Approval">
          {t(
            "The agent is waiting for its Tailnet registration to be approved. Headplane will attempt to auto-approve it, but if that fails, you can complete approval by visiting",
          )}{" "}
          <Link external styled to={loaderData.authUrl!}>
            {t("this link")}
          </Link>
          .
        </Notice>
      ) : undefined}

      {loaderData.error ? (
        <Notice variant="error" title="Sync Error">
          {loaderData.error}
        </Notice>
      ) : undefined}

      <fetcher.Form method="post">
        <Button type="submit" variant="heavy" disabled={isSyncing}>
          {isSyncing ? t("Syncing…") : t("Sync Now")}
        </Button>
      </fetcher.Form>
    </div>
  );
}
