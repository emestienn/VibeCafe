import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { SignUpForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "Create account" };

export default async function SignUpPage() {
  const t = await getTranslations("auth");
  const tCommon = await getTranslations("common");

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl">{t("signUpTitle")}</h1>
      <p className="mt-2 text-muted-foreground">{t("signUpSubtitle")}</p>

      <SignUpForm />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("haveAccount")}{" "}
        <Link href="/signin" className="font-medium text-foreground underline underline-offset-4">
          {tCommon("signIn")}
        </Link>
      </p>
    </div>
  );
}
