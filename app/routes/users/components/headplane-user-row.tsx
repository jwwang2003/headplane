import { CircleUser } from "lucide-react";

import StatusCircle from "~/components/status-circle";
import { useI18n, type Translate } from "~/i18n";
import type { Role } from "~/server/web/roles";
import cn from "~/utils/cn";

import type { HeadplaneUserData } from "../overview";
import MenuOptions from "./menu";

interface HeadplaneUserRowProps {
  user: HeadplaneUserData;
  headscaleUsers: { id: string; name: string; claimed: boolean }[];
  isSelf?: boolean;
  isOwner?: boolean;
}

export default function HeadplaneUserRow({
  user,
  headscaleUsers,
  isSelf,
  isOwner,
}: HeadplaneUserRowProps) {
  const isOnline = user.machines.some((machine) => machine.online);
  const { t, formatDate, formatDateTime } = useI18n();
  const lastSeen = user.machines.reduce(
    (acc, machine) => Math.max(acc, new Date(machine.lastSeen).getTime()),
    0,
  );

  const displayName = user.linkedHeadscaleUser?.displayName || user.name || user.email || user.sub;
  const displayUsername =
    user.linkedHeadscaleUser?.displayName &&
    user.linkedHeadscaleUser.displayName !== user.linkedHeadscaleUser.name
      ? user.linkedHeadscaleUser.name
      : undefined;
  const displayEmail = user.linkedHeadscaleUser?.email ?? user.email;

  return (
    <tr className="group hover:bg-mist-100 dark:hover:bg-mist-800" key={user.id}>
      <td className="py-2 pl-2">
        <div className="flex items-center">
          {user.profilePicUrl ? (
            <img alt={displayName} className="h-10 w-10 rounded-full" src={user.profilePicUrl} />
          ) : (
            <CircleUser className="h-10 w-10" />
          )}
          <div className="ml-4">
            <p className="leading-snug font-semibold">{displayName}</p>
            {displayUsername && <p className="text-sm opacity-50">{displayUsername}</p>}
            {displayEmail && <p className="text-sm opacity-50">{displayEmail}</p>}
            {!user.headscaleUserId && (
              <p className="text-xs text-amber-600 dark:text-amber-400">{t("Not linked")}</p>
            )}
          </div>
        </div>
      </td>
      <td className="py-2 pl-0.5">
        <p>{mapRoleToName(user.role, t)}</p>
      </td>
      <td className="py-2 pl-0.5">
        <p className="text-sm text-mist-600 dark:text-mist-300" suppressHydrationWarning>
          {user.lastLoginAt ? formatDate(user.lastLoginAt) : t("Never")}
        </p>
      </td>
      <td className="py-2 pl-0.5">
        {user.machines.length > 0 ? (
          <span
            className={cn("flex items-center gap-x-1 text-sm", "text-mist-600 dark:text-mist-300")}
          >
            <StatusCircle className="h-4 w-4" isOnline={isOnline} />
            <p suppressHydrationWarning>{isOnline ? t("Connected") : formatDateTime(lastSeen)}</p>
          </span>
        ) : (
          <p className="text-sm text-mist-600 dark:text-mist-300">{t("No machines")}</p>
        )}
      </td>
      <td className="py-2 pr-0.5">
        <MenuOptions
          currentLink={user.headscaleUserId ?? undefined}
          headscaleUsers={headscaleUsers}
          isOwner={isOwner}
          isSelf={isSelf}
          user={user}
        />
      </td>
    </tr>
  );
}

function mapRoleToName(role: Role, t: Translate) {
  switch (role) {
    case "owner":
      return t("Owner");
    case "admin":
      return t("Admin");
    case "network_admin":
      return t("Network Admin");
    case "it_admin":
      return t("IT Admin");
    case "auditor":
      return t("Auditor");
    case "viewer":
      return t("Viewer");
    case "member":
      return <p className="opacity-50">{t("Member")}</p>;
    default:
      return t("Unknown");
  }
}
