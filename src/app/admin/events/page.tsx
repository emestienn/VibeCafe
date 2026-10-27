import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { CreateEventDialog } from "@/components/admin/create-event-dialog";
import { DeleteButton } from "@/components/admin/delete-button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Admin · Events" };

export default async function AdminEventsPage() {
  const [events, t] = await Promise.all([
    prisma.event.findMany({
      orderBy: { startAt: "asc" },
      include: { cafe: { select: { name: true, slug: true } }, _count: { select: { participants: true } } },
    }),
    getTranslations("admin"),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl">{t("eventsNav")}</h1>
        <CreateEventDialog />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {events.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-muted-foreground">{t("noResults")}</p>
        )}
        {events.map((event) => (
          <div key={event.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Link href={`/events/${event.slug}`} className="font-medium hover:underline">{event.title}</Link>
                <Badge variant="secondary" className="font-normal">{event.category}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {event.cafe.name} · {new Date(event.startAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} · {event._count.participants}{event.capacity ? `/${event.capacity}` : ""} going
              </p>
            </div>
            <DeleteButton url={`/api/admin/events/${event.id}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
