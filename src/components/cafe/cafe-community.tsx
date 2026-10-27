import { CalendarDays, Clock, Users2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { initials } from "@/lib/utils";

import { JoinSessionButton } from "./join-session-button";

type RecentPost = {
  id: string;
  caption: string;
  images: { id: string; url: string }[];
  user: { id: string; name: string | null };
};

type CheckedInProfile = {
  user: { id: string; name: string | null; image: string | null };
  interests: { name: string }[];
};

type WorkSession = {
  id: string;
  title: string;
  category: string;
  topics: string[];
  untilTime: Date | null;
  user: { id: string; name: string | null; image: string | null };
};

type CafeEvent = {
  id: string;
  slug: string;
  title: string;
  startAt: Date;
  category: string;
};

export function CafeCommunity({
  checkedInProfiles,
  workSessions,
  events,
  recentPosts,
}: {
  checkedInProfiles: CheckedInProfile[];
  workSessions: WorkSession[];
  events: CafeEvent[];
  recentPosts: RecentPost[];
}) {
  const t = useTranslations("cafe");
  const topInterests = [...new Set(checkedInProfiles.flatMap((p) => p.interests.map((i) => i.name)))].slice(0, 6);

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg">{t("peopleHere")}</h3>
          <Button asChild size="sm" variant="outline">
            <Link href="/networking"><Users2 className="size-3.5" /> {t("meetPeopleHere")}</Link>
          </Button>
        </div>

        {checkedInProfiles.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{t("noOneCheckedIn")}</p>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("peopleInterestedIn", { count: checkedInProfiles.length, interests: topInterests.join(", ") })}
            </p>
            <div className="mt-4 flex -space-x-3">
              {checkedInProfiles.slice(0, 10).map(({ user }) => (
                <Link key={user.id} href={`/profile/${user.id}`}>
                  <Avatar className="size-10 border-2 border-surface">
                    <AvatarImage src={user.image ?? undefined} alt={user.name ?? "Member"} />
                    <AvatarFallback>{initials(user.name ?? "U")}</AvatarFallback>
                  </Avatar>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {recentPosts.length > 0 && (
        <div>
          <h3 className="font-display text-lg">{t("recentPosts")}</h3>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                href={`/profile/${post.user.id}`}
                className="group relative aspect-square overflow-hidden rounded-xl bg-surface-muted"
              >
                {post.images[0] && (
                  <Image src={post.images[0].url} alt="" fill className="object-cover transition-transform group-hover:scale-105" sizes="150px" />
                )}
                <div className="absolute inset-0 flex items-end bg-linear-to-t from-espresso-deep/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="line-clamp-2 text-[11px] text-cream">{post.caption}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-display text-lg">{t("workingHereNow")}</h3>
        {workSessions.length === 0 ? (
          <EmptyState
            icon={Clock}
            title={t("noActiveSessions")}
            description={t("noWorkSessionsDesc")}
            className="mt-3 py-10"
          />
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {workSessions.map((session) => (
              <div key={session.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                <Avatar className="size-10">
                  <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? "User"} />
                  <AvatarFallback>{initials(session.user.name ?? "U")}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{session.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="font-normal">{session.category}</Badge>
                    {session.untilTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" /> {new Date(session.untilTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>
                </div>
                <JoinSessionButton sessionId={session.id} />
              </div>
            ))}
          </div>
        )}
      </div>

      {events.length > 0 && (
        <div>
          <h3 className="font-display text-lg">{t("upcomingEvents")}</h3>
          <div className="mt-4 flex flex-col gap-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-surface-muted"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-foreground">
                  <CalendarDays className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.startAt).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
