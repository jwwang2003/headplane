import { GlobeLock, RouteOff } from "lucide-react";
import { useFetcher } from "react-router";

import Dialog, { DialogPanel } from "~/components/dialog";
import Link from "~/components/link";
import Switch from "~/components/switch";
import TableList from "~/components/table-list";
import Text from "~/components/text";
import Title from "~/components/title";
import { useI18n } from "~/i18n";
import { PopulatedNode } from "~/utils/node-info";

interface RoutesProps {
  node: PopulatedNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

// TODO: Support deleting routes
export default function Routes({ node, isOpen, setIsOpen }: RoutesProps) {
  const fetcher = useFetcher();
  const { t } = useI18n();

  const subnets = [
    ...node.customRouting.subnetApprovedRoutes,
    ...node.customRouting.subnetWaitingRoutes,
  ];

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel variant="unactionable">
        <Title>
          {t("Edit route settings of")} {node.givenName}
        </Title>
        <Text className="font-bold">{t("Subnet routes")}</Text>
        <Text>
          {t(
            "Connect to devices you can't install Tailscale on by advertising IP ranges as subnet routes.",
          )}{" "}
          <Link external styled to="https://tailscale.com/kb/1019/subnets">
            {t("Learn More")}
          </Link>
        </Text>
        <TableList className="mt-4">
          {subnets.length === 0 ? (
            <TableList.Item className="flex flex-col items-center gap-2.5 py-4 opacity-70">
              <RouteOff />
              <p className="font-semibold">{t("No routes are advertised by this machine")}</p>
            </TableList.Item>
          ) : undefined}
          {subnets.map((route) => (
            <TableList.Item key={route}>
              <p>{route}</p>
              <Switch
                defaultChecked={node.approvedRoutes.includes(route)}
                label="Enabled"
                onCheckedChange={(checked) => {
                  const form = new FormData();
                  form.set("action_id", "update_routes");
                  form.set("node_id", node.id);
                  form.set("routes", [route].join(","));

                  form.set("enabled", String(checked));
                  fetcher.submit(form, {
                    method: "POST",
                  });
                }}
              />
            </TableList.Item>
          ))}
        </TableList>
        <Text className="mt-8 font-bold">{t("Exit nodes")}</Text>
        <Text>
          {t("Allow your network to route internet traffic through this machine.")}{" "}
          <Link external styled to="https://tailscale.com/kb/1103/exit-nodes">
            {t("Learn More")}
          </Link>
        </Text>
        <TableList className="mt-4">
          {node.customRouting.exitRoutes.length === 0 ? (
            <TableList.Item className="flex flex-col items-center gap-2.5 py-4 opacity-70">
              <GlobeLock />
              <p className="font-semibold">{t("This machine is not an exit node")}</p>
            </TableList.Item>
          ) : (
            <TableList.Item>
              <p>{t("Use as exit node")}</p>
              <Switch
                defaultChecked={node.customRouting.exitApproved}
                label="Enabled"
                onCheckedChange={(checked) => {
                  const form = new FormData();
                  form.set("action_id", "update_routes");
                  form.set("node_id", node.id);
                  form.set("routes", node.customRouting.exitRoutes.map((route) => route).join(","));

                  form.set("enabled", String(checked));
                  fetcher.submit(form, {
                    method: "POST",
                  });
                }}
              />
            </TableList.Item>
          )}
        </TableList>
      </DialogPanel>
    </Dialog>
  );
}
