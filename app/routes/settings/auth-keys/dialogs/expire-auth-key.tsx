import Button from "~/components/button";
import Dialog, { DialogPanel } from "~/components/dialog";
import Text from "~/components/text";
import Title from "~/components/title";
import { T } from "~/i18n/provider";
import type { PreAuthKey, User } from "~/types";

interface ExpireAuthKeyProps {
  authKey: PreAuthKey;
  user: User;
}

export default function ExpireAuthKey({ authKey, user }: ExpireAuthKeyProps) {
  return (
    <Dialog>
      <Button variant="heavy">
        <T text={"Expire Key"} />
      </Button>
      <DialogPanel variant="destructive">
        <Title>
          <T text={"Expire auth key?"} />
        </Title>
        <input name="action_id" type="hidden" value="expire_preauthkey" />
        <input name="user_id" type="hidden" value={user.id} />
        <input name="key_id" type="hidden" value={authKey.id} />
        <input name="key" type="hidden" value={authKey.key} />
        <Text>
          <T
            text={
              "Expiring this authentication key will immediately prevent it from being used to authenticate new devices. This action cannot be undone."
            }
          />
        </Text>
      </DialogPanel>
    </Dialog>
  );
}
