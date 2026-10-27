import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { CreatePromoCodeDialog } from "@/components/admin/create-promo-code-dialog";
import { DeleteButton } from "@/components/admin/delete-button";
import { PromoCodeActiveToggle } from "@/components/admin/promo-code-active-toggle";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Admin · Promo codes" };

export default async function AdminPromoCodesPage() {
  const [codes, t] = await Promise.all([
    prisma.promoCode.findMany({
      orderBy: { createdAt: "desc" },
      include: { cafe: { select: { name: true, slug: true } }, _count: { select: { redemptions: true } } },
    }),
    getTranslations("admin"),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl">{t("promoCodesNav")}</h1>
        <CreatePromoCodeDialog />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {codes.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-muted-foreground">{t("noPromoCodes")}</p>
        )}
        {codes.map((promo) => (
          <div key={promo.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold">{promo.code}</span>
                <Badge variant="secondary" className="font-normal">{promo.requiredPlan}</Badge>
                {promo.discountPercent && <Badge variant="secondary" className="font-normal">{promo.discountPercent}%</Badge>}
                {!promo.isActive && <Badge variant="outline" className="font-normal text-muted-foreground">{t("deactivate")}</Badge>}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{promo.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {promo.cafe?.name ?? t("anyCafe")} · {t("redemptionsColumn")}: {promo._count.redemptions}{promo.maxRedemptions ? `/${promo.maxRedemptions}` : ""}
              </p>
            </div>
            <PromoCodeActiveToggle promoId={promo.id} initialActive={promo.isActive} />
            <DeleteButton url={`/api/admin/promo-codes/${promo.id}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
