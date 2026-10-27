import { Heart } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { CafeCard } from "@/components/cafe/cafe-card";
import { EmptyState } from "@/components/common/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Saved places" };

export default async function SavedPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin?callbackUrl=/saved");

  const t = await getTranslations("saved");

  const [collections, allFavorites] = await Promise.all([
    prisma.collection.findMany({
      where: { userId: session.user.id },
      include: { favorites: { include: { cafe: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: { cafe: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <span className="text-sm font-semibold uppercase tracking-wider text-accent">{t("eyebrow")}</span>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl">{t("title")}</h1>

      {allFavorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title={t("emptyTitle")}
          description={t("emptyDesc")}
          className="mt-8"
        />
      ) : (
        <Tabs defaultValue="all" className="mt-8">
          <TabsList className="flex-wrap">
            <TabsTrigger value="all">{t("all")} ({allFavorites.length})</TabsTrigger>
            {collections.map((c) => (
              <TabsTrigger key={c.id} value={c.id}>{c.name} ({c.favorites.length})</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {allFavorites.map((f) => (
                <CafeCard key={f.id} cafe={f.cafe} favorited />
              ))}
            </div>
          </TabsContent>

          {collections.map((c) => (
            <TabsContent key={c.id} value={c.id}>
              {c.favorites.length === 0 ? (
                <EmptyState icon={Heart} title={t("emptyCollection", { name: c.name })} description={t("emptyDesc")} className="mt-4" />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {c.favorites.map((f) => (
                    <CafeCard key={f.id} cafe={f.cafe} favorited />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
