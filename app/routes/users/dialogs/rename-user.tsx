import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Text from "~/components/text";
import Title from "~/components/title";
import { T, useI18n } from "~/i18n/provider";
import { User } from "~/types";
import { USERNAME_PATTERN, USERNAME_RULE } from "~/utils/user";

interface RenameProps {
  user: User;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function RenameUser({ user, isOpen, setIsOpen }: RenameProps) {
  const { t } = useI18n();
  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel>
        <Title>
          <T text={"Rename"} /> {user.name || user.displayName}?
        </Title>
        <Text className="mb-6">
          <T text={"Enter a new username for"} /> {user.name || user.displayName}
          <T
            text={
              ". Changing a username will not update any ACL policies that may refer to this user by their old username."
            }
          />
        </Text>
        <input name="action_id" type="hidden" value="rename_user" />
        <input name="headscale_user_id" type="hidden" value={user.id} />
        <Input
          defaultValue={user.name}
          description={t(USERNAME_RULE)}
          minLength={2}
          pattern={USERNAME_PATTERN}
          required
          title={t(USERNAME_RULE)}
          label={t("Username")}
          name="new_name"
          placeholder="my-new-name"
        />
      </DialogPanel>
    </Dialog>
  );
}
