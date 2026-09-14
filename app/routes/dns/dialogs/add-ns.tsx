import { type } from "arktype";
import { Split } from "lucide-react";

import Button from "~/components/button";
import Chip from "~/components/chip";
import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Switch from "~/components/switch";
import Text from "~/components/text";
import Title from "~/components/title";
import Tooltip from "~/components/tooltip";
import { useForm } from "~/hooks/use-form";
import { T, useI18n } from "~/i18n/provider";
import cn from "~/utils/cn";

const nsSchema = type({
  ns: "string.ip",
  split_name: "string > 0",
});

interface Props {
  nameservers: Record<string, string[]>;
}

export default function AddNameserver({ nameservers }: Props) {
  const { t } = useI18n();
  const form = useForm({
    schema: nsSchema,
    defaultValues: { split_name: "global" },
    validate: (values) => {
      const ns = values.ns as string;
      const domain = values.split_name as string;
      if (!ns) return undefined;

      const isSplit = domain !== "global";
      const isDuplicate = isSplit
        ? nameservers[domain]?.includes(ns)
        : Object.values(nameservers).some((nsList) => nsList.includes(ns));

      if (isDuplicate) {
        return { ns: "This nameserver already exists." };
      }

      return undefined;
    },
  });
  const split = (form.values.split_name as string) !== "global";

  return (
    <Dialog>
      <Button>
        <T text={"Add nameserver"} />
      </Button>
      <DialogPanel>
        <Title className="mb-4">
          <T text={"Add nameserver"} />
        </Title>
        <input name="action_id" type="hidden" value="add_ns" />
        <Input
          {...form.field("ns")}
          description={t("Use this IPv4 or IPv6 address to resolve names.")}
          required
          label={t("Nameserver")}
          placeholder="1.2.3.4"
        />
        <div className="mt-8 flex items-center justify-between">
          <div className="block">
            <div className="inline-flex items-center gap-2">
              <Text className="font-semibold">
                <T text={"Restrict to domain"} />
              </Text>
              <Tooltip
                content={t(
                  "Only clients that support split DNS (Tailscale v1.8 or later for most platforms) will use this nameserver. Older clients will ignore it.",
                )}
              >
                <Chip
                  className={cn("inline-flex items-center")}
                  leftIcon={<Split className="mr-0.5 h-3 w-3" />}
                  text="Split DNS"
                />
              </Tooltip>
            </div>
            <Text className="text-sm">
              <T text={"This nameserver will only be used for some domains."} />
            </Text>
          </div>
          <Switch
            label={t("Split DNS")}
            onCheckedChange={(checked) => {
              form.setValue("split_name", checked ? "" : "global");
            }}
          />
        </div>
        {split ? (
          <>
            <Text className="mt-8 font-semibold">
              <T text={"Domain"} />
            </Text>
            <Input
              {...form.field("split_name")}
              required
              label={t("Domain")}
              placeholder="example.com"
            />
            <Text className="text-sm">
              <T
                text={
                  "Only single-label or fully-qualified queries matching this suffix should use the nameserver."
                }
              />
            </Text>
          </>
        ) : (
          <input name="split_name" type="hidden" value="global" />
        )}
      </DialogPanel>
    </Dialog>
  );
}
