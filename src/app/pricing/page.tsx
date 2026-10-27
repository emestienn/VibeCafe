import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PricingPlans } from "@/components/monetization/pricing-plans";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Pricing" };

export default async function PricingPage() {
  const [session, t] = await Promise.all([auth(), getTranslations("pricing")]);

  const sub = session?.user
    ? await prisma.subscription.findUnique({ where: { userId: session.user.id } })
    : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-sm font-medium text-accent">{t("eyebrow")}</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="mt-10">
        <PricingPlans currentPlan={sub?.plan ?? "FREE"} isSignedIn={Boolean(session?.user)} />
      </div>
    </div>
  );
}
