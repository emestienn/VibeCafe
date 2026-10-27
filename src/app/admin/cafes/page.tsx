import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";

import { AdminSearch } from "@/components/admin/admin-search";
import { CafeEditDialog } from "@/components/admin/cafe-edit-dialog";
import { DeleteButton } from "@/components/admin/delete-button";
import { FeatureToggle } from "@/components/admin/feature-toggle";
import { RatingStars } from "@/components/common/rating-stars";
import { prisma } from "@/lib/prisma";
import { priceLevelLabel } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Cafés" };

export default async function AdminCafesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const t = await getTranslations("admin");

  const cafes = await prisma.cafe.findMany({
    where: q ? { name: { contains: q, mode: "insensitive" } } : undefined,
    orderBy: { vibeScore: "desc" },
    select: {
      id: true, name: true, slug: true, tagline: true, heroImageUrl: true,
      priceLevel: true, rating: true, reviewCount: true, vibeScore: true, featured: true, city: true,
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl">{t("cafesNav")}</h1>
        <AdminSearch initialValue={q} />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {cafes.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-muted-foreground">{t("noResults")}</p>
        )}
        {cafes.map((cafe) => (
          <div key={cafe.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-xl">
              <Image src={cafe.heroImageUrl} alt={cafe.name} fill className="object-cover" sizes="56px" />
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/cafe/${cafe.slug}`} className="truncate font-medium hover:underline">{cafe.name}</Link>
              <p className="truncate text-xs text-muted-foreground">{cafe.tagline}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <RatingStars rating={cafe.rating} size={11} />
                {cafe.reviewCount} · {priceLevelLabel(cafe.priceLevel)} · {cafe.city} · vibe {cafe.vibeScore}
              </div>
            </div>
            <FeatureToggle cafeId={cafe.id} initialFeatured={cafe.featured} />
            <CafeEditDialog cafeId={cafe.id} initial={{ name: cafe.name, tagline: cafe.tagline, priceLevel: cafe.priceLevel }} />
            <DeleteButton url={`/api/admin/cafes/${cafe.id}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
