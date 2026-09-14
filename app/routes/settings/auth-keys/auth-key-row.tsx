import Attribute from "~/components/attribute";
import { useI18n } from "~/i18n/provider";
import type { PreAuthKey, User } from "~/types";
import { getUserDisplayName } from "~/utils/user";

import ExpireAuthKey from "./dialogs/expire-auth-key";

interface Props {
  authKey: PreAuthKey;
  user: User | null;
}

export default function AuthKeyRow({ authKey, user }: Props) {
  const { t, locale } = useI18n();
  const createdAt = new Date(authKey.createdAt).toLocaleString(locale, {
    timeZone: "UTC",
    timeZoneName: "short",
  });
  const expiration = new Date(authKey.expiration).toLocaleString(locale, {
    timeZone: "UTC",
    timeZoneName: "short",
  });
  const isExpired =
    (authKey.used && !authKey.reusable) || new Date(authKey.expiration) < new Date();
  const userDisplay = user ? getUserDisplayName(user) : "(Tag Only)";

  return (
    <div className="w-full">
      <Attribute name={t("Key")} value={authKey.key} />
      <Attribute name={t("User")} value={userDisplay} />
      <Attribute name={t("Reusable")} value={authKey.reusable ? t("Yes") : t("No")} />
      <Attribute name={t("Ephemeral")} value={authKey.ephemeral ? t("Yes") : t("No")} />
      <Attribute name={t("Used")} value={authKey.used ? t("Yes") : t("No")} />
      <Attribute name={t("Created")} value={createdAt} />
      <Attribute name={t("Expiration")} value={expiration} />
      {!isExpired && user && (
        <div className="mt-2" suppressHydrationWarning>
          <ExpireAuthKey authKey={authKey} user={user} />
        </div>
      )}
    </div>
  );
}
