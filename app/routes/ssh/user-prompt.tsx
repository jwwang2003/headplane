import { Form } from "react-router";

import Button from "~/components/button";
import Card from "~/components/card";
import Code from "~/components/code";
import Input from "~/components/input";
import Link from "~/components/link";
import { T, useI18n } from "~/i18n/provider";

interface UserPromptProps {
  hostname: string;
}

export default function UserPrompt({ hostname }: UserPromptProps) {
  const { t } = useI18n();
  return (
    <div className="flex h-screen items-center justify-center">
      <Card>
        <Card.Title>
          <T text={"Enter Username"} />
        </Card.Title>
        <Card.Text className="mb-4">
          <T text={"Enter the username you want to use to connect to"} /> <Code>{hostname}</Code>
          {". "}
          <T
            text={
              "SSH via the web follows the same ACL rules as regular SSH access in Headscale, so only permitted usernames will work."
            }
          />
          <br />
          <br />
          <T text={"See the"} />{" "}
          <Link external styled to="https://headplane.net/features/ssh#troubleshooting">
            <T text={"troubleshooting guide"} />
          </Link>{" "}
          <T text={"for common errors."} />
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
            label={t("Username")}
            name="user"
            placeholder={t("Username")}
            className="mb-2"
            required
          />
          <Button type="submit" variant="heavy" className="w-full">
            <T text={"Connect"} />
          </Button>
        </Form>
      </Card>
    </div>
  );
}
