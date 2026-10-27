import { Radar } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/common/empty-state";
import { ConnectionRequests } from "@/components/community/connection-requests";
import { NetworkingToggle } from "@/components/community/networking-toggle";
import { PersonCard } from "@/components/community/person-card";

import { auth } from "@/lib/auth";
import { getCommunityProfiles, getPendingConnectionsForUser } from "@/lib/data/community";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Networking" };

export default async function NetworkingPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin?callbackUrl=/networking");

  const t = await getTranslations("networking");

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: { interests: true, currentCafe: { select: { name: true, slug: true } } },
  });

  const [nearby, pending] = await Promise.all([
    getCommunityProfiles({
      viewerId: session.user.id,
      viewerInterests: profile?.interests.map((i) => i.name) ?? [],
      onlyOpenToNetworking: true,
    }),
    getPendingConnectionsForUser(session.user.id),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <span className="text-sm font-semibold uppercase tracking-wider text-accent">{t("eyebrow")}</span>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl">{t("title")}</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">{t("subtitle")}</p>

      <div className="mt-8 flex flex-col gap-6">
        <NetworkingToggle
          initialOpen={profile?.isOpenToNetworking ?? false}
          initialVisible={profile?.isVisibleForNetworking ?? false}
          initialMessage={profile?.networkingMessage ?? null}
        />

        <ConnectionRequests
          requests={pending.map((p) => ({ id: p.id, message: p.message, requester: p.requester }))}
        />

        <div>
          <h2 className="font-display text-xl">{t("nearbyTitle")}</h2>
          {nearby.length === 0 ? (
            <EmptyState
              icon={Radar}
              title={t("noOneNearbyTitle")}
              description={t("noOneNearbyDesc")}
              className="mt-4"
            />
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {nearby.map((person) => (
                <PersonCard key={person.userId} person={person} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
