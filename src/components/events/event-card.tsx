import { CalendarDays, MapPin, Users2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";

export type EventCardData = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  startAt: Date;
  capacity: number | null;
  imageUrl: string | null;
  cafe: { name: string; slug: string; neighborhood: string };
  _count: { participants: number };
};

export function EventCard({ event }: { event: EventCardData }) {
  const t = useTranslations("events");
  const date = new Date(event.startAt);

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex gap-4 rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-accent-soft text-accent-foreground">
        <span className="text-xs font-medium uppercase">{date.toLocaleDateString([], { month: "short" })}</span>
        <span className="font-display text-2xl leading-none">{date.getDate()}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-normal">{event.category}</Badge>
        </div>
        <h3 className="mt-1.5 font-display text-lg leading-tight group-hover:underline">{event.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="size-3" /> {event.cafe.name}</span>
          <span className="flex items-center gap-1"><CalendarDays className="size-3" /> {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          <span className="flex items-center gap-1"><Users2 className="size-3" /> {event._count.participants}{event.capacity ? `/${event.capacity}` : ""} {t("going")}</span>
        </div>
      </div>
    </Link>
  );
}
