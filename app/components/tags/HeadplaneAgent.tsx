import { useI18n } from "~/i18n";
import cn from "~/utils/cn";

import Chip from "../chip";
import Tooltip from "../tooltip";

export function HeadplaneAgentTag() {
  const { t } = useI18n();
  return (
    <Tooltip content="This machine is running the Headplane agent, which allows it to provide host information in the web UI.">
      <Chip
        text={t("Headplane Agent")}
        className={cn("bg-purple-300 text-purple-900 dark:bg-purple-900 dark:text-purple-300")}
      />
    </Tooltip>
  );
}
