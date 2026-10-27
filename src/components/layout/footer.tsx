import { Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export async function Footer() {
  const [t, tNav, tFooter] = await Promise.all([
    getTranslations(),
    getTranslations("nav"),
    getTranslations("footer"),
  ]);

  const columns = [
    {
      title: tFooter("explore"),
      links: [
        { href: "/discover", label: tNav("exploreCafes") },
        { href: "/discover?view=map", label: tFooter("map") },
        { href: "/events", label: tNav("events") },
        { href: "/community", label: tNav("community") },
      ],
    },
    {
      title: tFooter("account"),
      links: [
        { href: "/profile", label: tNav("profile") },
        { href: "/saved", label: tNav("savedPlaces") },
        { href: "/feed", label: tNav("feed") },
        { href: "/networking", label: tNav("networking") },
      ],
    },
    {
      title: "VIBECAFE",
      links: [
        { href: "/signup", label: tFooter("signUpLink") },
        { href: "/signin", label: t("common.signIn") },
        { href: "/admin", label: tNav("admin") },
      ],
    },
  ];

  return (
    <footer className="mb-16 border-t border-border bg-surface md:mb-0">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </span>
              <span className="font-display text-lg font-semibold">VIBECAFE</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">{tFooter("tagline")}</p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-semibold text-foreground">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} VIBECAFE</p>
          <p>{tFooter("builtWith")}</p>
        </div>
      </div>
    </footer>
  );
}
