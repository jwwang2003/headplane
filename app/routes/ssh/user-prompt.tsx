import { Form } from "react-router";

import Button from "~/components/button";
import Card from "~/components/card";
import Code from "~/components/code";
import Input from "~/components/input";
import Link from "~/components/link";
import { useI18n } from "~/i18n";

interface UserPromptProps {
  hostname: string;
}

export default function UserPrompt({ hostname }: UserPromptProps) {
  const { t } = useI18n();
  return (
    <div className="flex h-screen items-center justify-center">
      <Card>
        <Card.Title>{t("Enter Username")}</Card.Title>
        <Card.Text className="mb-4">
          {t("Enter the username you want to use to connect to")} <Code>{hostname}</Code>
          {". "}
          {t(
            "SSH via the web follows the same ACL rules as regular SSH access in Headscale, so only permitted usernames will work.",
          )}
          <br />
          <br />
          {t("See the")}{" "}
          <Link external styled to="https://headplane.net/features/ssh#troubleshooting">
            {t("troubleshooting guide")}
          </Link>{" "}
          {t("for common errors.")}
        </Card.Text>
        <Form
          method="GET"
          onSubmit={(e) => {
            const formData = new FormData(e.currentTarget);
            const username = formData.get("user");
            if (!username) {
              e.preventDefault();
              return;
            }

            // We have to do a full navigation, since the page needs a full
            // reload to initialize the SSH connection due to us disabling the
            // revalidator.
            const url = new URL(window.location.href);
            url.searchParams.set("user", username.toString());
            window.location.assign(url.toString());
          }}
        >
          <Input
            labelHidden
            type="text"
            label="Username"
            name="user"
            placeholder={t("Username")}
            className="mb-2"
            required
          />
          <Button type="submit" variant="heavy" className="w-full">
            {t("Connect")}
          </Button>
        </Form>
      </Card>
    </div>
  );
}
