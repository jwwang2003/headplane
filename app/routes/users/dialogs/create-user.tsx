import Button from "~/components/button";
import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Text from "~/components/text";
import Title from "~/components/title";
import { useI18n } from "~/i18n";
import { USERNAME_PATTERN, USERNAME_RULE } from "~/utils/user";

interface CreateUserProps {
  isOidc?: boolean;
  isDisabled?: boolean;
}

export default function CreateUser({ isOidc, isDisabled }: CreateUserProps) {
  const { t } = useI18n();
  return (
    <Dialog>
      <Button disabled={isDisabled}>{t("Add user")}</Button>
      <DialogPanel>
        <Title>{t("Create a Headscale user")}</Title>
        <Text className="mb-6">
          {t(
            "This creates a new user in Headscale. The user will appear in the “Unlinked Headscale Users” section until they sign in",
          )}
          {isOidc ? ` ${t("through your OIDC provider")}` : ""}{" "}
          {t("and are automatically linked to a Headplane account.")}
        </Text>
        <input name="action_id" type="hidden" value="create_user" />
        <div className="flex flex-col gap-4">
          <Input
            description={USERNAME_RULE}
            minLength={2}
            pattern={USERNAME_PATTERN}
            required
            title={t(USERNAME_RULE)}
            label="Username"
            name="username"
            placeholder="my-new-user"
            type="text"
          />
          <Input label="Display Name" name="display_name" placeholder="John Doe" type="text" />
          <Input label="Email" name="email" placeholder="name@example.com" type="email" />
        </div>
      </DialogPanel>
    </Dialog>
  );
}
