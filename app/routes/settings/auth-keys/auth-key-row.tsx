import Attribute from "~/components/attribute";
import { useI18n } from "~/i18n";
import type { PreAuthKey, User } from "~/types";
import { getUserDisplayName } from "~/utils/user";

import ExpireAuthKey from "./dialogs/expire-auth-key";

interface Props {
  authKey: PreAuthKey;
  user: User | null;
}

export default function AuthKeyRow({ authKey, user }: Props) {
  const { t, formatDateTime, yesNo } = useI18n();
  const createdAt = formatDateTime(authKey.createdAt);
  const expiration = formatDateTime(authKey.expiration);
  const isExpired =
    (authKey.used && !authKey.reusable) || new Date(authKey.expiration) < new Date();
  const userDisplay = user ? getUserDisplayName(user) : t("(Tag Only)");

  return (
    <div className="w-full">
      <Attribute name="Key" value={authKey.key} />
      <Attribute name="User" value={userDisplay} />
      <Attribute name="Reusable" value={yesNo(authKey.reusable)} />
      <Attribute name="Ephemeral" value={yesNo(authKey.ephemeral)} />
      <Attribute name="Used" value={yesNo(authKey.used)} />
      <Attribute name="Created" value={createdAt} />
      <Attribute name="Expiration" value={expiration} />
      {!isExpired && user && (
        <div className="mt-2" suppressHydrationWarning>
          <ExpireAuthKey authKey={authKey} user={user} />
        </div>
      )}
    </div>
  );
}
