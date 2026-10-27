"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export function NetworkingToggle({
  initialOpen,
  initialVisible,
  initialMessage,
}: {
  initialOpen: boolean;
  initialVisible: boolean;
  initialMessage: string | null;
}) {
  const t = useTranslations("networking");
  const [open, setOpen] = useState(initialOpen);
  const [visible, setVisible] = useState(initialVisible);
  const [message, setMessage] = useState(initialMessage ?? "");
  const [saving, setSaving] = useState(false);

  const save = async (patch: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile/networking", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error();
    } catch {
      toast.error("Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-surface p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`size-2.5 rounded-full ${open ? "bg-olive" : "bg-border"}`} />
            <h2 className="font-display text-xl">{open ? t("openStatus") : t("closedStatus")}</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t("openDesc")}</p>
        </div>
        <Switch
          checked={open}
          onCheckedChange={(checked) => {
            setOpen(checked);
            save({ isOpenToNetworking: checked });
          }}
        />
      </div>

      {open && (
        <div className="mt-5 flex flex-col gap-4 border-t border-border pt-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t("visibleToNearby")}</p>
              <p className="text-xs text-muted-foreground">{t("visibleDesc")}</p>
            </div>
            <Switch
              checked={visible}
              onCheckedChange={(checked) => {
                setVisible(checked);
                save({ isVisibleForNetworking: checked });
              }}
            />
          </div>

          <div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("messagePlaceholder")}
              rows={2}
            />
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              disabled={saving}
              onClick={() => {
                save({ networkingMessage: message });
                toast.success(t("statusUpdated"));
              }}
            >
              {t("saveMessage")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
