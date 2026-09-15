import { useI18n } from "~/i18n";
import cn from "~/utils/cn";

export interface StatusCircleProps {
  isOnline: boolean;
  className?: string;
}

export default function StatusCircle({ isOnline, className }: StatusCircleProps) {
  const { t } = useI18n();
  return (
    <svg
      className={cn(
        isOnline ? "text-green-600 dark:text-green-500" : "text-mist-200 dark:text-mist-800",
        className,
      )}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <title>{isOnline ? t("Online") : t("Offline")}</title>
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}
