import { type } from "arktype";

import Button from "~/components/button";
import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Text from "~/components/text";
import Title from "~/components/title";
import { useForm } from "~/hooks/use-form";
import { T, useI18n } from "~/i18n/provider";

const groupSchema = type({
  group: "string > 0",
});

interface AddGroupProps {
  groups: string[];
  isDisabled?: boolean;
}

export default function AddGroup({ groups, isDisabled }: AddGroupProps) {
  const { t } = useI18n();
  const form = useForm({
    schema: groupSchema,
    validate: (values) => {
      const group = (values.group as string).trim();
      if (group.length === 0) return undefined;

      if (groups.includes(group)) {
        return { group: "This group already exists in the list." };
      }

      return undefined;
    },
  });

  return (
    <Dialog>
      <Button disabled={isDisabled}>
        <T text={"Add group"} />
      </Button>
      <DialogPanel>
        <Title>
          <T text={"Add group"} />
        </Title>
        <Text className="mb-4">
          <T
            text={
              "Add this group to a list of allowed groups that can authenticate with Headscale via OIDC."
            }
          />
        </Text>
        <input name="action_id" type="hidden" value="add_group" />
        <Input
          {...form.field("group")}
          description={t("The group to allow for OIDC authentication.")}
          required
          label={t("Group")}
          placeholder="admin"
        />
      </DialogPanel>
    </Dialog>
  );
}
