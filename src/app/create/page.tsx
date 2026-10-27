import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { CreatePostForm } from "@/components/post/create-post-form";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "Create post" };

export default async function CreatePage() {
  const session = await auth();
  if (!session?.user) redirect("/signin?callbackUrl=/create");

  const t = await getTranslations("post");

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl">{t("createPost")}</h1>
      <div className="mt-8">
        <CreatePostForm />
      </div>
    </div>
  );
}
