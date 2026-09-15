import Button from "~/components/button";
import Dialog, { DialogPanel } from "~/components/dialog";
import Text from "~/components/text";
import Title from "~/components/title";
import { useI18n } from "~/i18n";

interface Props {
  isEnabled: boolean;
  isDisabled: boolean;
}

export default function Modal({ isEnabled, isDisabled }: Props) {
  const { t } = useI18n();
  return (
    <Dialog>
      <Button disabled={isDisabled}>
        {isEnabled ? t("Disable") : t("Enable")} {t("Magic DNS")}
      </Button>
      <DialogPanel isDisabled={isDisabled}>
        <Title>
          {isEnabled ? t("Disable") : t("Enable")} {t("Magic DNS")}
        </Title>
        <Text>
          {t(
            "Devices will no longer be accessible via your tailnet domain. The search domain will also be disabled.",
          )}
        </Text>
        <input type="hidden" name="action_id" value="toggle_magic" />
        <input type="hidden" name="new_state" value={isEnabled ? "disabled" : "enabled"} />
      </DialogPanel>
    </Dialog>
  );
}
