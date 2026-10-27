import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ProfileView } from "@/components/profile/profile-view";
import { auth } from "@/lib/auth";
import { getFullProfile } from "@/lib/data/profile";

export const metadata: Metadata = { title: "Your profile" };

export default async function OwnProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/signin?callbackUrl=/profile");

  const profile = await getFullProfile(session.user.id);
  if (!profile) redirect("/signin");

  return <ProfileView profile={profile} isOwnProfile />;
}
