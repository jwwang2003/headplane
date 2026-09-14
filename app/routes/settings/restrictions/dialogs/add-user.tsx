import { type } from "arktype";

import Button from "~/components/button";
import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Text from "~/components/text";
import Title from "~/components/title";
import { useForm } from "~/hooks/use-form";
import { T, useI18n } from "~/i18n/provider";

const userSchema = type({
  user: "string > 0",
});

interface AddUserProps {
  users: string[];
  isDisabled?: boolean;
}

export default function AddUser({ users, isDisabled }: AddUserProps) {
  const { t } = useI18n();
  const form = useForm({
    schema: userSchema,
    validate: (values) => {
      const user = (values.user as string).trim();
      if (user.length === 0) return undefined;

      if (users.includes(user)) {
        return { user: "This user already exists in the list." };
      }

      return undefined;
    },
  });

  return (
    <Dialog>
      <Button disabled={isDisabled}>
        <T text={"Add user"} />
      </Button>
      <DialogPanel>
        <Title>
          <T text={"Add user"} />
        </Title>
        <Text className="mb-4">
          <T
            text={
              "Add this user to a list of allowed users that can authenticate with Headscale via OIDC."
            }
          />
        </Text>
        <input name="action_id" type="hidden" value="add_user" />
        <Input
          {...form.field("user")}
          description={t("The user to allow for OIDC authentication.")}
          required
          label={t("User")}
          placeholder="john_doe"
        />
      </DialogPanel>
    </Dialog>
  );
}
