import { Info } from "lucide-react";

import { useI18n } from "~/i18n";
import cn from "~/utils/cn";

import Chip from "../chip";
import Tooltip from "../tooltip";

export interface ExitNodeTagProps {
  isEnabled?: boolean;
}

export function ExitNodeTag({ isEnabled }: ExitNodeTagProps) {
  const { t } = useI18n();
  return (
    <Tooltip
      content={
        isEnabled
          ? t("This machine is acting as an exit node.")
          : t(
              'This machine is requesting to be used as an exit node. Review this from the "Edit route settings..." option in the machine\'s menu.',
            )
      }
    >
      <Chip
        text={t("Exit Node")}
        className={cn("bg-blue-300 text-blue-900 dark:bg-blue-900 dark:text-blue-300")}
        rightIcon={isEnabled ? undefined : <Info className="h-full w-fit" />}
      />
    </Tooltip>
  );
}
