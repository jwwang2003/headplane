import { useI18n } from "~/i18n/provider";
import cn from "~/utils/cn";

import Chip from "../chip";
import Tooltip from "../tooltip";

export function TailscaleSSHTag() {
  const { t } = useI18n();
  return (
    <Tooltip
      content={t(
        "This machine advertises Tailscale SSH, which allows you to authenticate SSH credentials using your Tailscale account and via the Headplane web UI.",
      )}
    >
      <Chip
        text={t("Tailscale SSH")}
        className={cn("bg-lime-500 text-lime-900 dark:bg-lime-900 dark:text-lime-500")}
      />
    </Tooltip>
  );
}
