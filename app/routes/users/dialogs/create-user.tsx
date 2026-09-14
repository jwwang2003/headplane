import Button from "~/components/button";
import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Text from "~/components/text";
import Title from "~/components/title";
import { T, useI18n } from "~/i18n/provider";
import { USERNAME_PATTERN, USERNAME_RULE } from "~/utils/user";

interface CreateUserProps {
  isOidc?: boolean;
  isDisabled?: boolean;
}

export default function CreateUser({ isOidc, isDisabled }: CreateUserProps) {
  const { t } = useI18n();
  return (
    <Dialog>
      <Button disabled={isDisabled}>
        <T text={"Add user"} />
      </Button>
      <DialogPanel>
        <Title>
          <T text={"Create a Headscale user"} />
        </Title>
        <Text className="mb-6">
          <T
            text={
              "This creates a new user in Headscale. The user will appear in the “Unlinked Headscale Users” section until they sign in"
            }
          />
          {isOidc ? (
            <>
              {" "}
              <T text="through your OIDC provider" />
            </>
          ) : null}{" "}
          <T text={"and are automatically linked to a Headplane account."} />
        </Text>
        <input name="action_id" type="hidden" value="create_user" />
        <div className="flex flex-col gap-4">
          <Input
            description={t(USERNAME_RULE)}
            minLength={2}
            pattern={USERNAME_PATTERN}
            required
            title={t(USERNAME_RULE)}
            label={t("Username")}
            name="username"
            placeholder="my-new-user"
            type="text"
          />
          <Input label={t("Display Name")} name="display_name" placeholder="John Doe" type="text" />
          <Input label={t("Email")} name="email" placeholder="name@example.com" type="email" />
        </div>
      </DialogPanel>
    </Dialog>
  );
}
