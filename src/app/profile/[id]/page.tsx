import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ProfileView } from "@/components/profile/profile-view";
import { auth } from "@/lib/auth";
import { getFollowState, getFullProfile } from "@/lib/data/profile";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id }, select: { name: true } });
  return user ? { title: user.name ?? "Profile" } : {};
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (session?.user?.id === id) redirect("/profile");

  const profile = await getFullProfile(id);
  if (!profile) notFound();

  let connectionState: "none" | "pending" | "connected" = "none";
  let isFollowing = false;
  if (session?.user) {
    const [connection, following] = await Promise.all([
      prisma.connection.findFirst({
        where: {
          OR: [
            { requesterId: session.user.id, recipientId: id },
            { requesterId: id, recipientId: session.user.id },
          ],
        },
      }),
      getFollowState(session.user.id, id),
    ]);
    if (connection) connectionState = connection.status === "ACCEPTED" ? "connected" : "pending";
    isFollowing = following;
  }

  return <ProfileView profile={profile} isOwnProfile={false} connectionState={connectionState} isFollowing={isFollowing} />;
}
