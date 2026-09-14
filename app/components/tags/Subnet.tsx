import { Info } from "lucide-react";

import { T, useI18n } from "~/i18n/provider";
import cn from "~/utils/cn";

import Chip from "../chip";
import Tooltip from "../tooltip";

export interface SubnetTagProps {
  isEnabled?: boolean;
}

export function SubnetTag({ isEnabled }: SubnetTagProps) {
  const { t } = useI18n();
  return (
    <Tooltip
      content={
        isEnabled ? (
          <>
            <T text={"This machine advertises subnet routes."} />
          </>
        ) : (
          <>
            <T
              text={
                'This machine has unadvertised subnet routes. Review this from the "Edit route settings..." option in the machine\'s menu.'
              }
            />
          </>
        )
      }
    >
      <Chip
        text={t("Subnets")}
        className={cn("bg-blue-300 text-blue-900 dark:bg-blue-900 dark:text-blue-300")}
        rightIcon={isEnabled ? undefined : <Info className="h-full w-fit" />}
      />
    </Tooltip>
  );
}
