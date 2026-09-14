import { CheckCircle, CircleSlash, Info, UserCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { data } from "react-router";

import Attribute from "~/components/attribute";
import Button from "~/components/button";
import Card from "~/components/card";
import Chip from "~/components/chip";
import Link from "~/components/link";
import StatusCircle from "~/components/status-circle";
import Tooltip from "~/components/tooltip";
import { T, useI18n } from "~/i18n/provider";
import {
  agentsContext,
  headscaleConfigContext,
  headscaleContext,
  headscaleLiveStoreContext,
  requestApiContext,
} from "~/server/context";
import { nodesResource, usersResource } from "~/server/headscale/live-store";
import cn from "~/utils/cn";
import { getOSInfo, getTSVersion } from "~/utils/host-info";
import { isNoExpiry, mapNodes, sortAssignableTags } from "~/utils/node-info";
import { getUserDisplayName } from "~/utils/user";

import type { Route } from "./+types/machine";
import { mapTagsToComponents, uiTagsForNode } from "./components/machine-row";
import MenuOptions from "./components/menu";
import Routes from "./dialogs/routes";
import { machineAction } from "./machine-actions";

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const agentsFeature = context.get(agentsContext);
  const getRequestApi = context.get(requestApiContext);
  const headscale = context.get(headscaleContext);
  const headscaleConfig = context.get(headscaleConfigContext);
  const headscaleLiveStore = context.get(headscaleLiveStoreContext);

  if (!params.id) {
    throw new Error("No machine ID provided");
  }

  if (params.id.endsWith(".ico")) {
    throw data(null, { status: 204 });
  }

  const magic = headscaleConfig.getMagicDNSBaseDomain();

  const { api } = await getRequestApi(request);
  const [nodesSnap, usersSnap] = await Promise.all([
    headscaleLiveStore.get(nodesResource, api),
    headscaleLiveStore.get(usersResource, api),
  ]);
  const nodes = nodesSnap.data;
  const users = usersSnap.data;
  const node = nodes.find((node) => node.id === params.id);
  if (node == null) {
    throw data(null, { status: 404 });
  }

  const agents = agentsFeature.state === "enabled" ? agentsFeature.value : undefined;
  const [lookup, policyResult] = await Promise.allSettled([
    agents?.lookup([node.nodeKey]),
    api.policy.get(),
  ]);
  const stats = lookup.status === "fulfilled" ? lookup.value : undefined;
  const [enhancedNode] = mapNodes([node], stats);
  const tags = [...node.tags].toSorted();
  const supportsNodeOwnerChange = !headscale.capabilities.nodeOwnerIsImmutable;
  const supportsDisablingKeyExpiry = headscale.capabilities.keyExpiryCanBeDisabled;
  const agentSync = agents?.lastSync();
  const policy = policyResult.status === "fulfilled" ? policyResult.value.policy : undefined;

  return {
    agent: agentSync
      ? {
          syncedAt: agentSync.syncedAt?.toISOString() ?? null,
          nodeCount: agentSync.nodeCount,
          nodeKey: agents?.agentNodeKey(),
        }
      : undefined,
    existingTags: sortAssignableTags(nodes, policy),
    magic,
    node: enhancedNode,
    stats: stats?.[enhancedNode.nodeKey],
    supportsNodeOwnerChange: supportsNodeOwnerChange,
    supportsDisablingKeyExpiry: supportsDisablingKeyExpiry,
    tags,
    users,
  };
}

export const action = machineAction;

export default function Page({
  loaderData: {
    node,
    tags,
    users,
    magic,
    agent,
    stats,
    existingTags,
    supportsNodeOwnerChange,
    supportsDisablingKeyExpiry,
  },
}: Route.ComponentProps) {
  const { t, locale } = useI18n();
  const [showRouting, setShowRouting] = useState(false);

  const uiTags = useMemo(() => {
    const tags = uiTagsForNode(node, agent?.nodeKey === node.nodeKey);
    return tags;
  }, [node, agent]);

  return (
    <div>
      <p className="text-md mb-8">
        <Link className="font-medium" to="/machines">
          <T text={"All Machines"} />
        </Link>
        <span className="mx-2">/</span>
        {node.givenName}
      </p>
      <div
        className={cn(
          "flex justify-between items-center pb-2",
          "border-b border-mist-100 dark:border-mist-800",
        )}
      >
        <span className="flex items-baseline gap-x-4 text-sm">
          <h1 className="text-2xl font-medium">{node.givenName}</h1>
          <StatusCircle className="h-4 w-4" isOnline={node.online} />
        </span>
        <MenuOptions
          existingTags={existingTags}
          isFullButton
          magic={magic}
          node={node}
          users={users}
          supportsNodeOwnerChange={supportsNodeOwnerChange}
          supportsDisablingKeyExpiry={supportsDisablingKeyExpiry}
        />
      </div>
      <div className="mb-4 flex gap-1">
        <div className="border-r border-mist-100 p-2 pr-4 dark:border-mist-800">
          <span className="flex items-center gap-x-1 text-sm text-mist-600 dark:text-mist-300">
            <T text={"Managed by"} />
            <Tooltip content={t("By default, a machine’s permissions match its creator’s.")}>
              <Info className="p-1" />
            </Tooltip>
          </span>
          <div className="mt-1 flex items-center gap-x-2.5">
            <UserCircle />
            {node.user ? getUserDisplayName(node.user) : t("Tag-owned")}
          </div>
        </div>
        <div className="p-2 pl-4">
          <p className="text-sm text-mist-600 dark:text-mist-300">
            <T text={"Status"} />
          </p>
          <div className="mt-1 mb-8 flex gap-1">
            {mapTagsToComponents(node, uiTags)}
            {tags.map((tag) => (
              <Chip key={tag} text={tag} />
            ))}
          </div>
        </div>
      </div>
      <Routes isOpen={showRouting} node={node} setIsOpen={setShowRouting} />
      <h2 className="mt-8 text-xl font-medium">
        <T text={"Subnets & Routing"} />
      </h2>
      <div className="mb-4 flex items-center justify-between">
        <p>
          <T text={"Subnets let you expose physical network routes onto Tailscale."} />{" "}
          <Link external styled to="https://tailscale.com/kb/1019/subnets">
            <T text={"Learn More"} />
          </Link>
        </p>
        <Button onClick={() => setShowRouting(true)}>
          <T text={"Review"} />
        </Button>
      </div>
      <Card
        className={cn(
          "w-full max-w-full grid sm:grid-cols-2",
          "md:grid-cols-4 gap-8 mr-2 text-sm mb-8",
        )}
        variant="flat"
      >
        <div>
          <span className="flex items-center gap-x-1 text-mist-600 dark:text-mist-300">
            <T text={"Approved"} />
            <Tooltip content={t("Traffic to these routes are being routed through this machine.")}>
              <Info className="h-3.5 w-3.5" />
            </Tooltip>
          </span>
          <div className="mt-1">
            {node.customRouting.subnetApprovedRoutes.length === 0 ? (
              <span className="opacity-50">—</span>
            ) : (
              <ul className="leading-normal">
                {node.customRouting.subnetApprovedRoutes.map((route) => (
                  <li key={route}>{route}</li>
                ))}
              </ul>
            )}
          </div>
          <Button
            className="mt-1.5 px-1.5 py-0.5"
            onClick={() => setShowRouting(true)}
            variant="ghost"
          >
            <T text={"Edit"} />
          </Button>
        </div>
        <div>
          <span className="flex items-center gap-x-1 text-mist-600 dark:text-mist-300">
            <T text={"Awaiting Approval"} />
            <Tooltip
              content={t(
                "This machine is advertising these routes, but they must be approved before traffic will be routed to them.",
              )}
            >
              <Info className="h-3.5 w-3.5" />
            </Tooltip>
          </span>
          <div className="mt-1">
            {node.customRouting.subnetWaitingRoutes.length === 0 ? (
              <span className="opacity-50">—</span>
            ) : (
              <ul className="leading-normal">
                {node.customRouting.subnetWaitingRoutes.map((route) => (
                  <li key={route}>{route}</li>
                ))}
              </ul>
            )}
          </div>
          <Button
            className="mt-1.5 px-1.5 py-0.5"
            onClick={() => setShowRouting(true)}
            variant="ghost"
          >
            <T text={"Edit"} />
          </Button>
        </div>
        <div>
          <span className="flex items-center gap-x-1 text-mist-600 dark:text-mist-300">
            <T text={"Exit Node"} />
            <Tooltip content={t("Whether this machine can act as an exit node for your tailnet.")}>
              <Info className="h-3.5 w-3.5" />
            </Tooltip>
          </span>
          <div className="mt-1">
            {node.customRouting.exitRoutes.length === 0 ? (
              <span className="opacity-50">—</span>
            ) : node.customRouting.exitApproved ? (
              <span className="flex items-center gap-x-1">
                <CheckCircle className="h-3.5 w-3.5 text-green-700" />
                <T text={"Allowed"} />
              </span>
            ) : (
              <span className="flex items-center gap-x-1">
                <CircleSlash className="h-3.5 w-3.5 text-red-700" />
                <T text={"Awaiting Approval"} />
              </span>
            )}
          </div>
          <Button
            className="mt-1.5 px-1.5 py-0.5"
            onClick={() => setShowRouting(true)}
            variant="ghost"
          >
            <T text={"Edit"} />
          </Button>
        </div>
      </Card>
      <h2 className="text-xl font-medium">
        <T text={"Machine Details"} />
      </h2>
      <p className="mb-4">
        <T text={"Information about this machine’s network. Used to debug connection issues."} />
      </p>
      <Card
        className="grid w-full max-w-full grid-cols-1 gap-y-2 sm:gap-x-12 lg:grid-cols-2"
        variant="flat"
      >
        <div className="flex flex-col gap-1">
          <Attribute
            name={t("Creator")}
            value={node.user ? getUserDisplayName(node.user) : t("Tag-owned")}
          />
          <Attribute name={t("Machine name")} value={node.givenName} />
          <Attribute
            name={t("OS hostname")}
            tooltip={t(
              "OS hostname is published by the machine’s operating system and is used as the default name for the machine.",
            )}
            value={node.name}
          />
          {stats ? (
            <>
              <Attribute name={t("OS")} value={getOSInfo(stats)} />
              <Attribute name={t("Tailscale version")} value={getTSVersion(stats)} />
            </>
          ) : undefined}
          <Attribute
            name={t("ID")}
            tooltip={t("ID for this machine. Used in the Headscale API.")}
            value={node.id}
          />
          <Attribute
            isCopyable
            name={t("Node key")}
            tooltip={t("Public key which uniquely identifies this machine.")}
            value={node.nodeKey}
          />
          <Attribute
            name={t("Created")}
            value={new Date(node.createdAt).toLocaleString(locale, {
              timeZone: "UTC",
              timeZoneName: "short",
            })}
          />
          <Attribute
            name={t("Last Seen")}
            value={
              node.online
                ? t("Connected")
                : new Date(node.lastSeen).toLocaleString(locale, {
                    timeZone: "UTC",
                    timeZoneName: "short",
                  })
            }
          />
          <Attribute
            name={t("Key expiry")}
            value={
              !isNoExpiry(node.expiry)
                ? new Date(node.expiry!).toLocaleString(locale, {
                    timeZone: "UTC",
                    timeZoneName: "short",
                  })
                : t("Never")
            }
          />
          {magic ? (
            <Attribute isCopyable name={t("Domain")} value={`${node.givenName}.${magic}`} />
          ) : undefined}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-mist-600 uppercase dark:text-mist-300">
            <T text={"Addresses"} />
          </p>
          <Attribute
            isCopyable
            name={t("Tailscale IPv4")}
            tooltip={t(
              "This machine’s IPv4 address within your tailnet (your private Tailscale network).",
            )}
            value={getIpv4Address(node.ipAddresses)}
          />
          <Attribute
            isCopyable
            name={t("Tailscale IPv6")}
            tooltip={t(
              "This machine’s IPv6 address within your tailnet (your private Tailscale network). Connections within your tailnet support IPv6 even if your ISP does not.",
            )}
            value={getIpv6Address(node.ipAddresses)}
          />
          <Attribute
            isCopyable
            name={t("Short domain")}
            tooltip={t("Users of your tailnet can use this DNS short name to access this machine.")}
            value={node.givenName}
          />
          {magic ? (
            <Attribute
              isCopyable
              name={t("Full domain")}
              tooltip={t("Users of your tailnet can use this DNS name to access this machine.")}
              value={`${node.givenName}.${magic}`}
            />
          ) : undefined}
          {stats?.Endpoints ? (
            <Attribute name={t("Endpoints")} value={stats?.Endpoints?.join("\n") ?? "—"} />
          ) : undefined}
          {stats ? (
            <>
              <p className="mt-4 text-sm font-semibold text-mist-600 uppercase dark:text-mist-300">
                <T text={"Client Connectivity"} />
              </p>
              <Attribute
                name={t("Varies")}
                tooltip={t(
                  "Whether the machine is behind a difficult NAT that varies the machine’s IP address depending on the destination.",
                )}
                value={stats.NetInfo?.MappingVariesByDestIP ? t("Yes") : t("No")}
              />
              <Attribute
                name={t("Hairpinning")}
                tooltip={t("Whether the machine needs to traverse NATs with hairpinning.")}
                value={stats.NetInfo?.HairPinning ? t("Yes") : t("No")}
              />
              <Attribute name="IPv6" value={stats.NetInfo?.WorkingIPv6 ? t("Yes") : t("No")} />
              <Attribute name="UDP" value={stats.NetInfo?.WorkingUDP ? t("Yes") : t("No")} />
              <Attribute name="UPnP" value={stats.NetInfo?.UPnP ? t("Yes") : t("No")} />
              <Attribute name="PCP" value={stats.NetInfo?.PCP ? t("Yes") : t("No")} />
              <Attribute name="NAT-PMP" value={stats.NetInfo?.PMP ? t("Yes") : t("No")} />
            </>
          ) : undefined}
        </div>
      </Card>
    </div>
  );
}

function getIpv4Address(addresses: string[]) {
  for (const address of addresses) {
    if (address.startsWith("100.")) {
      // Return the first CGNAT address
      return address;
    }
  }

  return "—";
}

function getIpv6Address(addresses: string[]) {
  for (const address of addresses) {
    if (address.startsWith("fd")) {
      // Return the first IPv6 address
      return address;
    }
  }

  return "—";
}
