import { Clock, DollarSign, Laptop, Plug, Users2, Volume2, Wifi } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { CafeCommunity } from "@/components/cafe/cafe-community";
import { CafeGallery } from "@/components/cafe/cafe-gallery";
import { CheckInButton } from "@/components/cafe/checkin-button";
import { FavoriteButton } from "@/components/cafe/favorite-button";
import { MenuTabs } from "@/components/cafe/menu-tabs";
import { ReviewCard } from "@/components/cafe/review-card";
import { ReviewForm } from "@/components/cafe/review-form";
import { ReviewSummary } from "@/components/cafe/review-summary";
import { VibeScoreRing } from "@/components/cafe/vibe-score-ring";
import { WorkSessionForm } from "@/components/cafe/work-session-form";
import { RatingStars } from "@/components/common/rating-stars";
import { CafeDiscountBadge } from "@/components/monetization/cafe-discount-badge";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";
import { noiseLevelI18nKey, vibeBreakdown, whyPeopleComeHere } from "@/lib/cafe-score";
import { getCafeBySlug } from "@/lib/data/cafes";
import { getCafePosts } from "@/lib/data/posts";
import { formatHoursToday } from "@/lib/hours";
import { prisma } from "@/lib/prisma";
import { priceLevelLabel } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cafe = await prisma.cafe.findUnique({ where: { slug }, select: { name: true, tagline: true } });
  if (!cafe) return {};
  return { title: cafe.name, description: cafe.tagline };
}

export default async function CafeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [cafe, session, t] = await Promise.all([getCafeBySlug(slug), auth(), getTranslations("cafe")]);

  if (!cafe) notFound();

  const recentPosts = await getCafePosts(cafe.id, session?.user?.id, 8);

  let favorited = false;
  let likedReviewIds = new Set<string>();
  let checkedIn = false;

  if (session?.user) {
    const [fav, likes, profile] = await Promise.all([
      prisma.favorite.findUnique({ where: { userId_cafeId: { userId: session.user.id, cafeId: cafe.id } } }),
      prisma.reviewLike.findMany({ where: { userId: session.user.id, review: { cafeId: cafe.id } }, select: { reviewId: true } }),
      prisma.profile.findUnique({ where: { userId: session.user.id }, select: { currentCafeId: true } }),
    ]);
    favorited = Boolean(fav);
    likedReviewIds = new Set(likes.map((l) => l.reviewId));
    checkedIn = profile?.currentCafeId === cafe.id;
  }

  const breakdown = vibeBreakdown(cafe);
  const reasons = whyPeopleComeHere(cafe);
  const todayHours = formatHoursToday(cafe.openingHours);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <CafeGallery images={cafe.images.map((i) => ({ url: i.url, alt: i.alt }))} name={cafe.name} />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-3xl sm:text-4xl">{cafe.name}</h1>
                <Badge variant="secondary">{priceLevelLabel(cafe.priceLevel)}</Badge>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <RatingStars rating={cafe.rating} />
                <span className="font-medium">{cafe.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({cafe.reviewCount} {t("reviews")})</span>
              </div>
              <p className="mt-3 max-w-xl text-muted-foreground">{cafe.tagline}</p>
              {cafe.promoCodes[0] && cafe.promoCodes[0].discountPercent && (
                <CafeDiscountBadge
                  percent={cafe.promoCodes[0].discountPercent}
                  requiredPlan={cafe.promoCodes[0].requiredPlan}
                />
              )}
            </div>
            <div className="flex flex-col items-center gap-1">
              <VibeScoreRing score={cafe.vibeScore} size={64} />
              <span className="text-[11px] font-medium text-muted-foreground">{t("vibeScoreLabel")}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <FavoriteButton cafeId={cafe.id} initialFavorited={favorited} className="static" />
            <CheckInButton cafeId={cafe.id} initialCheckedIn={checkedIn} />
            <ReviewForm cafeId={cafe.id} />
            <WorkSessionForm cafeId={cafe.id} />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-4">
            <InfoStat icon={Clock} label={t("today")} value={todayHours} />
            <InfoStat icon={DollarSign} label={t("avgPrice")} value={`$${cafe.avgPriceUsd.toFixed(0)}`} />
            <InfoStat icon={Wifi} label={t("wifi")} value={`${cafe.wifiScore}/100`} />
            <InfoStat icon={Plug} label={t("outlets")} value={`${cafe.outletsScore}/100`} />
            <InfoStat icon={Volume2} label={t("noise")} value={t(`noiseLevel.${noiseLevelI18nKey(cafe.noiseLevel)}`)} />
            <InfoStat icon={Laptop} label={t("laptopFriendly")} value={cafe.isLaptopFriendly ? t("yes") : t("limited")} />
            <InfoStat icon={Users2} label={t("networking")} value={`${cafe.networkingScore}/100`} />
            <InfoStat icon={Users2} label={t("meetings")} value={cafe.isMeetingFriendly ? t("goodFit") : t("casualOnly")} />
          </div>

          <section className="mt-10">
            <h2 className="font-display text-xl">{t("whyPeopleComeHere")}</h2>
            <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {reasons.map((reason) => (
                <li key={reason} className="flex items-start gap-2 text-sm text-foreground/90">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" /> {reason}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-xl">{t("vibeScoreBreakdown")}</h2>
            <div className="mt-4 flex flex-col gap-3">
              {breakdown.map((b) => (
                <div key={b.i18nKey} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-sm text-muted-foreground">{t(`breakdown.${b.i18nKey}`)}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${b.value}%` }} />
                  </div>
                  <span className="w-10 shrink-0 text-right text-sm font-semibold">{b.value}%</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <p className="text-muted-foreground leading-relaxed">{cafe.description}</p>
            <p className="mt-2 text-sm text-muted-foreground">📍 {cafe.address}, {cafe.neighborhood}, {cafe.city}</p>
          </section>

          <section className="mt-12">
            <Tabs defaultValue="menu">
              <TabsList>
                <TabsTrigger value="menu">{t("menu")}</TabsTrigger>
                <TabsTrigger value="reviews">{t("reviews")} ({cafe.reviewCount})</TabsTrigger>
                <TabsTrigger value="community">{t("community")}</TabsTrigger>
              </TabsList>

              <TabsContent value="menu">
                {cafe.menu ? <MenuTabs items={cafe.menu.items} /> : <p className="text-sm text-muted-foreground">{t("menuComingSoon")}</p>}
              </TabsContent>

              <TabsContent value="reviews">
                <div className="mb-6 lg:hidden">
                  <ReviewSummary reviews={cafe.reviews} />
                </div>
                {cafe.reviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("noReviewsYet")}</p>
                ) : (
                  cafe.reviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      initialLiked={likedReviewIds.has(review.id)}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="community">
                <CafeCommunity
                  checkedInProfiles={cafe.checkedInProfiles}
                  recentPosts={recentPosts}
                  workSessions={cafe.workSessions}
                  events={cafe.events}
                />
              </TabsContent>
            </Tabs>
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="font-display text-base">{t("amenities")}</h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {cafe.amenities.map((a) => (
                  <Badge key={a.id} variant="secondary" className="font-normal">{a.name}</Badge>
                ))}
              </div>
            </div>
            <ReviewSummary reviews={cafe.reviews} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoStat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="size-3.5" /> {label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
