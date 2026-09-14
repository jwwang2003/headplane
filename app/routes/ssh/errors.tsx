import { AlertCircle } from "lucide-react";

import Card from "~/components/card";
import Link from "~/components/link";
import { T, useI18n } from "~/i18n/provider";

export const sshErrors = {
  wasm_missing: {
    title: "Browser SSH is not available",
    message: "This version of Headplane was not built with browser SSH support.",
    anchor: "#ssh-not-available",
  },

  agent_required: {
    title: "Browser SSH requires the Headplane agent",
    message: "Browser SSH is only available when the Headplane agent integration is enabled.",
    anchor: "#agent-required",
  },

  oidc_required: {
    title: "Browser SSH requires OIDC authentication",
    message: "Browser SSH is only available when OIDC authentication is enabled.",
    anchor: "#oidc-required",
  },

  node_not_found: (hostname: string) => ({
    title: "Node not found",
    message: "No node found with hostname {hostname}.",
    values: { hostname },
    anchor: "#node-not-found",
  }),

  user_not_linked: {
    title: "User account not linked",
    message:
      "You'll need to link your user account to a Headscale user before you can use Browser SSH.",
    anchor: "#user-not-linked",
  },
} as const;

interface SSHErrorBoundaryProps {
  title: string;
  message: string;
  values?: Record<string, string>;
  anchor: string;
}

export function isSSHError(error: unknown): error is SSHErrorBoundaryProps {
  return (
    typeof error === "object" &&
    error !== null &&
    "title" in error &&
    "message" in error &&
    "anchor" in error &&
    typeof error.title === "string" &&
    typeof error.message === "string" &&
    typeof error.anchor === "string"
  );
}

const DOCS_BASE = "https://headplane.net/features/ssh";

export function SSHErrorBoundary({ title, message, values, anchor }: SSHErrorBoundaryProps) {
  const { t } = useI18n();
  return (
    <Card className="w-screen" variant="flat">
      <div className="flex items-center justify-between gap-4">
        <Card.Title>{t(title)}</Card.Title>
        <AlertCircle className="mb-2 h-6 w-6 text-red-500" />
      </div>
      <Card.Text>
        {t(message, values)}
        <br />
        <br />
        <Link to={`${DOCS_BASE}${anchor}`} external styled>
          <T text={"Headplane SSH Documentation"} />
        </Link>{" "}
      </Card.Text>
    </Card>
  );
}
