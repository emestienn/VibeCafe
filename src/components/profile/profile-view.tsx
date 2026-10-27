import { CalendarDays, Coffee, Coins, Flame, Grid3x3, MapPin, Star, Users2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { CafeCard } from "@/components/cafe/cafe-card";
import { RatingStars } from "@/components/common/rating-stars";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConnectButton } from "@/components/community/connect-button";
import { FollowButton } from "@/components/profile/follow-button";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { BadgeDisplay } from "@/components/profile/badge-display";
import { PostCard } from "@/components/post/post-card";
import { EmptyState } from "@/components/common/empty-state";
import { PlanBadge } from "@/components/monetization/plan-badge";
import { RedeemPromoCode } from "@/components/monetization/redeem-promo-code";
import { formatRelativeTime, initials } from "@/lib/utils";

import type { getFullProfile } from "@/lib/data/profile";

type FullProfile = NonNullable<Awaited<ReturnType<typeof getFullProfile>>>;

export function ProfileView({
  profile,
  isOwnProfile,
  connectionState = "none",
  isFollowing = false,
}: {
  profile: FullProfile;
  isOwnProfile: boolean;
  connectionState?: "none" | "pending" | "connected";
  isFollowing?: boolean;
}) {
  const t = useTranslations("profile");
  const tNetworking = useTranslations("networking");
  const tPost = useTranslations("post");
  const p = profile.profile;
  const connections = [
    ...profile.connectionsSent.map((c) => c.recipient),
    ...profile.connectionsReceived.map((c) => c.requester),
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <Avatar className="size-24 border border-border">
          <AvatarImage src={profile.image ?? undefined} alt={profile.name ?? "Member"} />
          <AvatarFallback className="text-xl">{initials(profile.name ?? "U")}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl">{profile.name}</h1>
            <PlanBadge plan={profile.subscription?.plan ?? "FREE"} />
            {p?.isOpenToNetworking && (
              <span className="flex items-center gap-1 rounded-full bg-olive/15 px-2.5 py-0.5 text-xs font-medium text-olive">
                <span className="size-1.5 rounded-full bg-olive" /> {tNetworking("openStatus")}
              </span>
            )}
          </div>
          {p?.profession && <p className="mt-0.5 text-muted-foreground">{p.profession}</p>}
          {p?.bio && <p className="mt-2 max-w-xl text-sm text-foreground/90">{p.bio}</p>}
          {p?.currentCafe && (
            <Link href={`/cafe/${p.currentCafe.slug}`} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
              <MapPin className="size-3" /> {t("currentlyAt")} {p.currentCafe.name}
            </Link>
          )}
          <div className="mt-3 flex items-center gap-4 text-sm">
            <span><strong className="font-display">{profile._count.posts}</strong> <span className="text-muted-foreground">{t("posts")}</span></span>
            <span><strong className="font-display">{profile._count.followedBy}</strong> <span className="text-muted-foreground">{t("followers")}</span></span>
            <span><strong className="font-display">{profile._count.following}</strong> <span className="text-muted-foreground">{t("followingCount")}</span></span>
          </div>
        </div>

        <div className="flex gap-2">
          {isOwnProfile ? (
            <EditProfileDialog
              initial={{
                profession: p?.profession ?? null,
                bio: p?.bio ?? null,
                location: p?.location ?? null,
                goals: p?.goals ?? null,
                interests: p?.interests.map((i) => i.name) ?? [],
              }}
            />
          ) : (
            <>
              <FollowButton userId={profile.id} initialFollowing={isFollowing} />
              <ConnectButton recipientId={profile.id} initialState={connectionState} />
            </>
          )}
        </div>
      </div>

      {p?.interests && p.interests.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {p.interests.map((i) => (
            <Badge key={i.id} variant="secondary" className="font-normal">{i.name}</Badge>
          ))}
        </div>
      )}

      {p?.goals && (
        <p className="mt-4 rounded-xl border border-dashed border-border bg-surface px-4 py-2.5 text-sm text-muted-foreground">
          🎯 {p.goals}
        </p>
      )}

      <div className="mt-6 grid grid-cols-3 gap-4 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-6">
        <Stat icon={Coffee} label={t("visited")} value={profile._count.cafeVisits} />
        <Stat icon={Star} label={t("reviewsCount")} value={profile._count.reviews} />
        <Stat icon={Users2} label={t("connections")} value={connections.length} />
        <Stat icon={MapPin} label={t("points")} value={p?.points ?? 0} />
        <Stat icon={Coins} label={t("coins")} value={p?.coins ?? 0} />
        <Stat icon={Flame} label={t("streak")} value={p?.currentStreak ?? 0} />
      </div>

      {isOwnProfile && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <RedeemPromoCode />
          <Link href="/pricing" className="shrink-0 text-sm font-medium text-accent hover:underline">
            {t("managePlan")}
          </Link>
        </div>
      )}

      {p?.badges && p.badges.length > 0 && (
        <div className="mt-6">
          <BadgeDisplay earned={p.badges} />
        </div>
      )}

      <Tabs defaultValue="posts" className="mt-10">
        <TabsList className="flex-wrap">
          <TabsTrigger value="posts">{t("postsTab")} ({profile._count.posts})</TabsTrigger>
          <TabsTrigger value="places">{t("placesTab")} ({profile.favorites.length})</TabsTrigger>
          <TabsTrigger value="reviews">{t("reviewsTab")} ({profile.reviews.length})</TabsTrigger>
          <TabsTrigger value="events">{t("eventsTab")} ({profile.eventParticipations.length})</TabsTrigger>
          <TabsTrigger value="connections">{t("connectionsTab")} ({connections.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          {profile.posts.length === 0 ? (
            <EmptyState icon={Grid3x3} title={tPost("noPostsYet")} description={tPost("beFirstToPost")} className="mt-4" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {profile.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="places">
          {profile.favorites.length === 0 ? (
            <EmptyState icon={Coffee} title={t("noPlacesTitle")} description={t("noPlacesDesc")} className="mt-4" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {profile.favorites.map((f) => (
                <CafeCard key={f.id} cafe={f.cafe} favorited />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews">
          {profile.reviews.length === 0 ? (
            <EmptyState icon={Star} title={t("noReviewsTitle")} description={t("noReviewsDesc")} className="mt-4" />
          ) : (
            <div className="flex flex-col gap-4">
              {profile.reviews.map((review) => (
                <Link
                  key={review.id}
                  href={`/cafe/${review.cafe.slug}`}
                  className="flex flex-col gap-1.5 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-surface-muted"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{review.cafe.name}</span>
                    <RatingStars rating={review.rating} size={12} />
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{review.body}</p>
                  <span className="text-xs text-muted-foreground">{formatRelativeTime(review.createdAt)}</span>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="events">
          {profile.eventParticipations.length === 0 ? (
            <EmptyState icon={CalendarDays} title={t("noEventsTitle")} description={t("noEventsDesc")} className="mt-4" />
          ) : (
            <div className="flex flex-col gap-3">
              {profile.eventParticipations.map((ep) => (
                <Link
                  key={ep.id}
                  href={`/events/${ep.event.slug}`}
                  className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-surface-muted"
                >
                  <div>
                    <p className="font-medium">{ep.event.title}</p>
                    <p className="text-xs text-muted-foreground">{ep.event.cafe.name}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(ep.event.startAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="connections">
          {connections.length === 0 ? (
            <EmptyState icon={Users2} title={t("noConnectionsTitle")} description={t("noConnectionsDesc")} className="mt-4" />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {connections.map((c) => (
                <Link key={c.id} href={`/profile/${c.id}`} className="flex flex-col items-center gap-2 text-center">
                  <Avatar className="size-14">
                    <AvatarImage src={c.image ?? undefined} alt={c.name ?? "Member"} />
                    <AvatarFallback>{initials(c.name ?? "U")}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">{c.name}</span>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <Icon className="size-4 text-muted-foreground" />
      <span className="font-display text-xl">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
