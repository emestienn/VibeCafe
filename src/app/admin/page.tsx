import { CalendarDays, Coffee, Crown, Radar, ShieldAlert, Sparkles, Star, Ticket, Users, Users2, Wallet } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";

import { CityPieChart, GrowthAreaChart, RatingsBarChart } from "@/components/admin/charts";
import { FeatureToggle } from "@/components/admin/feature-toggle";
import { RatingStars } from "@/components/common/rating-stars";
import { getAdminStats } from "@/lib/data/admin";
import { formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin dashboard" };

export default async function AdminPage() {
  const [stats, t] = await Promise.all([getAdminStats(), getTranslations("admin")]);

  const cards = [
    { icon: Users, label: t("totalUsers"), value: stats.totals.totalUsers },
    { icon: Coffee, label: t("cafes"), value: stats.totals.totalCafes },
    { icon: Sparkles, label: t("postsNav"), value: stats.totals.totalPosts },
    { icon: Star, label: t("reviews"), value: stats.totals.totalReviews },
    { icon: CalendarDays, label: t("events"), value: stats.totals.totalEvents },
    { icon: Users2, label: t("connections"), value: stats.totals.totalConnections },
    { icon: Radar, label: t("openToNetworking"), value: stats.totals.activeNetworkers },
    { icon: ShieldAlert, label: t("banned"), value: stats.totals.bannedUsers },
  ];

  return (
    <div>
      <span className="text-sm font-semibold uppercase tracking-wider text-accent">{t("eyebrow")}</span>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl">{t("title")}</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-accent/30 bg-accent/5 p-5">
          <Wallet className="size-4 text-accent" />
          <p className="mt-3 font-display text-3xl text-accent">{stats.totals.mrr.toLocaleString()} so&apos;m</p>
          <p className="text-xs text-muted-foreground">{t("mrr")}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <Crown className="size-4 text-muted-foreground" />
          <p className="mt-3 font-display text-3xl">{stats.totals.plusCount + stats.totals.proCount}</p>
          <p className="text-xs text-muted-foreground">{t("subscribers")}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <Ticket className="size-4 text-muted-foreground" />
          <p className="mt-3 font-display text-3xl">{stats.totals.totalPromoRedemptions}</p>
          <p className="text-xs text-muted-foreground">{t("promoRedemptionsStat")}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-4">
            <c.icon className="size-4 text-muted-foreground" />
            <p className="mt-3 font-display text-2xl">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg">{t("signupsChart")}</h2>
          <GrowthAreaChart data={stats.signupsChart} />
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg">{t("postsChart")}</h2>
          <GrowthAreaChart data={stats.postsChart} />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg">{t("reviewsByRating")}</h2>
          <RatingsBarChart data={stats.ratingsChart} />
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg">{t("cafesByCity")}</h2>
          <CityPieChart data={stats.citiesChart} />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">{t("mostReviewed")}</h2>
            <Link href="/admin/cafes" className="text-xs font-medium text-accent hover:underline">{t("viewAll")}</Link>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {stats.popularCafes.map((cafe) => (
              <div key={cafe.id} className="flex items-center gap-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-xl">
                  <Image src={cafe.heroImageUrl} alt={cafe.name} fill className="object-cover" sizes="48px" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/cafe/${cafe.slug}`} className="truncate text-sm font-medium hover:underline">{cafe.name}</Link>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <RatingStars rating={cafe.rating} size={11} /> {cafe.reviewCount} {t("reviewsShort")} · {t("vibeShort")} {cafe.vibeScore}
                  </div>
                </div>
                <FeatureToggle cafeId={cafe.id} initialFeatured={cafe.featured} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">{t("recentReviews")}</h2>
            <Link href="/admin/reviews" className="text-xs font-medium text-accent hover:underline">{t("viewAll")}</Link>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {stats.recentReviews.map((review) => (
              <div key={review.id} className="text-sm">
                <p>
                  <span className="font-medium">{review.user.name}</span> {t("reviewed")}{" "}
                  <span className="font-medium">{review.cafe.name}</span>
                </p>
                <p className="text-xs text-muted-foreground">{formatRelativeTime(review.createdAt)} · {review.rating}★</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg">{t("recentUsers")}</h2>
          <Link href="/admin/users" className="text-xs font-medium text-accent hover:underline">{t("viewAll")}</Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="pb-2 font-medium">{t("name")}</th>
                <th className="pb-2 font-medium">{t("email")}</th>
                <th className="pb-2 font-medium">{t("role")}</th>
                <th className="pb-2 font-medium">{t("joined")}</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-none">
                  <td className="py-2.5 font-medium">{u.name}</td>
                  <td className="py-2.5 text-muted-foreground">{u.email}</td>
                  <td className="py-2.5 text-muted-foreground">{u.role}</td>
                  <td className="py-2.5 text-muted-foreground">{formatRelativeTime(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
