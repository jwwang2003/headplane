import Card from "~/components/card";
import { useI18n } from "~/i18n";

export default function Logout() {
  const { t } = useI18n();
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Card className="m-4 max-w-md sm:m-0">
        <Card.Title>{t("You have been logged out")}</Card.Title>
        <Card.Text>
          {t(
            "You can now close this window. If you would like to log in again, please refresh the page.",
          )}
        </Card.Text>
      </Card>
    </div>
  );
}
