"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export function UserRoleSelect({ userId, role }: { userId: string; role: "USER" | "ADMIN" }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [value, setValue] = useState(role);
  const [loading, setLoading] = useState(false);

  const update = async (next: "USER" | "ADMIN") => {
    setLoading(true);
    setValue(next);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: next }),
      });
      if (!res.ok) throw new Error();
      toast.success(t("roleUpdated"));
      router.refresh();
    } catch {
      setValue(role);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Select value={value} onValueChange={(v) => update(v as "USER" | "ADMIN")} disabled={loading}>
      <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="USER">USER</SelectItem>
        <SelectItem value="ADMIN">ADMIN</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function UserBanToggle({ userId, banned }: { userId: string; banned: boolean }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [value, setValue] = useState(banned);
  const [loading, setLoading] = useState(false);

  const toggle = async (next: boolean) => {
    setLoading(true);
    setValue(next);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: next }),
      });
      if (!res.ok) throw new Error();
      toast.success(t("updated"));
      router.refresh();
    } catch {
      setValue(banned);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Switch checked={value} onCheckedChange={toggle} disabled={loading} />
      <span className="text-xs text-muted-foreground">{value ? t("banned") : t("active")}</span>
    </div>
  );
}
