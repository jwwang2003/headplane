import Button from "~/components/button";
import Dialog, { DialogPanel } from "~/components/dialog";
import Text from "~/components/text";
import Title from "~/components/title";
import { useI18n } from "~/i18n";
import type { PreAuthKey, User } from "~/types";

interface ExpireAuthKeyProps {
  authKey: PreAuthKey;
  user: User;
}

export default function ExpireAuthKey({ authKey, user }: ExpireAuthKeyProps) {
  const { t } = useI18n();
  return (
    <Dialog>
      <Button variant="heavy">{t("Expire Key")}</Button>
      <DialogPanel variant="destructive">
        <Title>{t("Expire auth key?")}</Title>
        <input name="action_id" type="hidden" value="expire_preauthkey" />
        <input name="user_id" type="hidden" value={user.id} />
        <input name="key_id" type="hidden" value={authKey.id} />
        <input name="key" type="hidden" value={authKey.key} />
        <Text>
          {t(
            "Expiring this authentication key will immediately prevent it from being used to authenticate new devices. This action cannot be undone.",
          )}
        </Text>
      </DialogPanel>
    </Dialog>
  );
}
