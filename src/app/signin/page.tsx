import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Suspense } from "react";

import { SignInForm } from "@/components/auth/signin-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage() {
  const t = await getTranslations("auth");

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl">{t("signInTitle")}</h1>
      <p className="mt-2 text-muted-foreground">{t("signInSubtitle")}</p>

      <Suspense fallback={null}>
        <SignInForm />
      </Suspense>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("noAccount")}{" "}
        <Link href="/signup" className="font-medium text-foreground underline underline-offset-4">
          {t("createAccount")}
        </Link>
      </p>

      <p className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-4 text-center text-xs text-muted-foreground">
        {t("demoAccount")}: <span className="font-mono">admin@vibecafe.app</span> / <span className="font-mono">admin1234</span>
        <br />
        {t("orAnySeeded")} · password <span className="font-mono">password123</span>
      </p>
    </div>
  );
}
