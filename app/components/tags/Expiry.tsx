import { useI18n } from "~/i18n";

import Chip from "../chip";
import Tooltip from "../tooltip";

export interface ExpiryTagProps {
  variant: "expired" | "no-expiry";
  expiry?: string;
}

export function ExpiryTag({ variant, expiry }: ExpiryTagProps) {
  const { t, formatShortDate } = useI18n();

  return (
    <Tooltip
      content={
        variant === "expired"
          ? t(
              "This machine is expired and will not be able to connect to the network. Re-authenticate with Tailscale on the machine to re-enable it.",
            )
          : t("This machine has key expiry disabled and will never need to re-authenticate.")
      }
    >
      <Chip
        text={
          variant === "expired"
            ? t("Expired {date}", { date: formatShortDate(expiry!) })
            : t("No expiry")
        }
        className="bg-mist-200 text-mist-800 dark:bg-mist-800 dark:text-mist-200"
      />
    </Tooltip>
  );
}
