"use client";

import { Users2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { EmptyState } from "@/components/common/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { PersonCard, type PersonCardData } from "./person-card";
import { WorkSessionCard, type WorkSessionCardData } from "./work-session-card";

export function CommunityView({
  profiles,
  workSessions,
  interests,
  activeInterest,
}: {
  profiles: PersonCardData[];
  workSessions: WorkSessionCardData[];
  interests: string[];
  activeInterest?: string;
}) {
  const t = useTranslations("community");
  const router = useRouter();

  const setInterest = (interest: string) => {
    if (activeInterest === interest) router.push("/community");
    else router.push(`/community?interest=${encodeURIComponent(interest)}`);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <span className="text-sm font-semibold uppercase tracking-wider text-accent">{t("eyebrow")}</span>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl">{t("title")}</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">{t("subtitle")}</p>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {interests.map((interest) => (
          <button
            key={interest}
            onClick={() => setInterest(interest)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              activeInterest === interest
                ? "border-accent bg-accent-soft text-accent-foreground"
                : "border-border bg-card hover:bg-surface-muted",
            )}
          >
            {interest}
          </button>
        ))}
      </div>

      <Tabs defaultValue="people" className="mt-8">
        <TabsList>
          <TabsTrigger value="people">{t("peopleTab")} ({profiles.length})</TabsTrigger>
          <TabsTrigger value="working">{t("workingTab")} ({workSessions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="people">
          {profiles.length === 0 ? (
            <EmptyState
              icon={Users2}
              title={t("noMatchTitle")}
              description={t("noMatchDesc")}
              className="mt-4"
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {profiles.map((person) => (
                <PersonCard key={person.userId} person={person} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="working">
          {workSessions.length === 0 ? (
            <EmptyState
              icon={Users2}
              title={t("noSessionsTitle")}
              description={t("noSessionsDesc")}
              className="mt-4"
            />
          ) : (
            <div className="flex flex-col gap-3">
              {workSessions.map((session) => (
                <WorkSessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
