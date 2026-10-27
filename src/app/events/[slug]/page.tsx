import { CalendarDays, Clock, MapPin, Users2 } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { JoinEventButton } from "@/components/events/join-event-button";
import { auth } from "@/lib/auth";
import { getEventBySlug } from "@/lib/data/events";
import { initials } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  return event ? { title: event.title } : {};
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [event, session, t] = await Promise.all([getEventBySlug(slug), auth(), getTranslations("events")]);
  if (!event) notFound();

  const isJoined = Boolean(session?.user && event.participants.some((p) => p.user.id === session.user.id));
  const startAt = new Date(event.startAt);
  const endAt = new Date(event.endAt);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {event.imageUrl && (
        <div className="relative h-56 w-full overflow-hidden rounded-3xl sm:h-72">
          <Image src={event.imageUrl} alt={event.title} fill className="object-cover" />
        </div>
      )}

      <div className="mt-6">
        <Badge variant="secondary">{event.category}</Badge>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl">{event.title}</h1>
        <p className="mt-3 text-muted-foreground">{event.description}</p>

        <div className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays className="size-4 text-muted-foreground" />
            {startAt.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="size-4 text-muted-foreground" />
            {startAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – {endAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
          <Link href={`/cafe/${event.cafe.slug}`} className="flex items-center gap-2 text-sm hover:underline">
            <MapPin className="size-4 text-muted-foreground" />
            {event.cafe.name} · {event.cafe.neighborhood}
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Users2 className="size-4 text-muted-foreground" />
            {event._count.participants}{event.capacity ? ` / ${event.capacity}` : ""} {t("going")}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <JoinEventButton eventId={event.id} initialJoined={isJoined} />
          <span className="text-sm text-muted-foreground">
            {t("hostedBy")} <span className="font-medium text-foreground">{event.organizer.name}</span>
          </span>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl">{t("whosGoing")}</h2>
          {event.participants.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">{t("noOneYet")}</p>
          ) : (
            <div className="mt-4 flex -space-x-3">
              {event.participants.map(({ user }) => (
                <Link key={user.id} href={`/profile/${user.id}`}>
                  <Avatar className="size-11 border-2 border-background">
                    <AvatarImage src={user.image ?? undefined} alt={user.name ?? "Member"} />
                    <AvatarFallback>{initials(user.name ?? "U")}</AvatarFallback>
                  </Avatar>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
