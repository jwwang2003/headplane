import { useNavigate } from "react-router";

import Dialog, { DialogPanel } from "~/components/dialog";
import Text from "~/components/text";
import Title from "~/components/title";
import { useI18n } from "~/i18n";
import type { Machine } from "~/types";

interface DeleteProps {
  machine: Machine;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Delete({ machine, isOpen, setIsOpen }: DeleteProps) {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel onSubmit={() => navigate("/machines")} variant="destructive">
        <Title>
          {t("Remove")} {machine.givenName}
        </Title>
        <Text>
          {t(
            "This machine will be permanently removed from your network. To re-add it, you will need to reauthenticate to your tailnet from the device.",
          )}
        </Text>
        <input name="action_id" type="hidden" value="delete" />
        <input name="node_id" type="hidden" value={machine.id} />
      </DialogPanel>
    </Dialog>
  );
}
