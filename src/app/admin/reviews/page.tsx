import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { DeleteButton } from "@/components/admin/delete-button";
import { RatingStars } from "@/components/common/rating-stars";
import { prisma } from "@/lib/prisma";
import { formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Reviews" };

export default async function AdminReviewsPage() {
  const [reviews, t] = await Promise.all([
    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 60,
      include: {
        user: { select: { id: true, name: true } },
        cafe: { select: { name: true, slug: true } },
      },
    }),
    getTranslations("admin"),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl">{t("reviewsNav")}</h1>

      <div className="mt-6 flex flex-col gap-3">
        {reviews.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-muted-foreground">{t("noResults")}</p>
        )}
        {reviews.map((review) => (
          <div key={review.id} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{review.user.name}</span>
                <RatingStars rating={review.rating} size={11} />
              </div>
              <Link href={`/cafe/${review.cafe.slug}`} className="text-xs text-accent hover:underline">{review.cafe.name}</Link>
              <p className="mt-1.5 text-sm text-foreground/90">{review.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(review.createdAt)}</p>
            </div>
            <DeleteButton url={`/api/admin/reviews/${review.id}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
