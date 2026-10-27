"use client";

import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils";

export type PendingConnection = {
  id: string;
  message: string | null;
  requester: { id: string; name: string | null; image: string | null };
};

export function ConnectionRequests({ requests }: { requests: PendingConnection[] }) {
  const t = useTranslations("networking");
  const router = useRouter();
  const [resolved, setResolved] = useState<Set<string>>(new Set());

  const respond = async (id: string, status: "ACCEPTED" | "DECLINED") => {
    try {
      const res = await fetch("/api/connections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId: id, status }),
      });
      if (!res.ok) throw new Error();
      setResolved((prev) => new Set(prev).add(id));
      toast.success(status === "ACCEPTED" ? t("connectionAccepted") : t("requestDeclined"));
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    }
  };

  const visible = requests.filter((r) => !resolved.has(r.id));
  if (visible.length === 0) return null;

  return (
    <div className="rounded-3xl border border-border bg-surface p-6">
      <h2 className="font-display text-lg">{t("connectionRequests")}</h2>
      <div className="mt-4 flex flex-col gap-3">
        {visible.map((req) => (
          <div key={req.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
            <Avatar>
              <AvatarImage src={req.requester.image ?? undefined} alt={req.requester.name ?? "User"} />
              <AvatarFallback>{initials(req.requester.name ?? "U")}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{req.requester.name}</p>
              {req.message && <p className="truncate text-xs text-muted-foreground">{req.message}</p>}
            </div>
            <Button size="icon" variant="ghost" className="text-olive" onClick={() => respond(req.id, "ACCEPTED")}>
              <Check className="size-4" />
            </Button>
            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => respond(req.id, "DECLINED")}>
              <X className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
