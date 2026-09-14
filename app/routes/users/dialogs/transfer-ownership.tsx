import Dialog, { DialogPanel } from "~/components/dialog";
import Notice from "~/components/notice";
import Text from "~/components/text";
import Title from "~/components/title";
import { T } from "~/i18n/provider";

interface TransferOwnershipProps {
  targetHeadplaneUserId: string;
  targetDisplayName: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function TransferOwnership({
  targetHeadplaneUserId,
  targetDisplayName,
  isOpen,
  setIsOpen,
}: TransferOwnershipProps) {
  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel variant="destructive">
        <Title>
          <T text={"Transfer ownership to"} /> {targetDisplayName}?
        </Title>
        <Text className="mb-6">
          <T text={"This will make"} /> {targetDisplayName}{" "}
          <T
            text={
              "the new owner of this Headplane instance. You will be demoted to an Admin. This action cannot be easily undone."
            }
          />
        </Text>
        <Notice variant="warning">
          <T
            text={
              "Only the owner can transfer ownership. After this, you will no longer be able to manage ownership."
            }
          />
        </Notice>
        <input name="action_id" type="hidden" value="transfer_ownership" />
        <input name="headplane_user_id" type="hidden" value={targetHeadplaneUserId} />
      </DialogPanel>
    </Dialog>
  );
}
