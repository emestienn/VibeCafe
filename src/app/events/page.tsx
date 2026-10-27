import { CalendarDays } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { EventCard } from "@/components/events/event-card";
import { EmptyState } from "@/components/common/empty-state";
import { getUpcomingEvents } from "@/lib/data/events";

export const metadata: Metadata = { title: "Events" };

export default async function EventsPage() {
  const [events, t] = await Promise.all([getUpcomingEvents(), getTranslations("events")]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <span className="text-sm font-semibold uppercase tracking-wider text-accent">{t("eyebrow")}</span>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl">{t("title")}</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">{t("subtitle")}</p>

      <div className="mt-8 flex flex-col gap-4">
        {events.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title={t("noUpcomingTitle")}
            description={t("noUpcomingDesc")}
          />
        ) : (
          events.map((event) => <EventCard key={event.id} event={event} />)
        )}
      </div>
    </div>
  );
}
