import { CalendarDays, Coffee, LayoutDashboard, MessageSquare, Sparkles, Ticket, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/signin?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/");

  const t = await getTranslations("admin");

  const NAV = [
    { href: "/admin", label: t("overview"), icon: LayoutDashboard },
    { href: "/admin/cafes", label: t("cafesNav"), icon: Coffee },
    { href: "/admin/users", label: t("usersNav"), icon: Users },
    { href: "/admin/posts", label: t("postsNav"), icon: Sparkles },
    { href: "/admin/reviews", label: t("reviewsNav"), icon: MessageSquare },
    { href: "/admin/events", label: t("eventsNav"), icon: CalendarDays },
    { href: "/admin/promo-codes", label: t("promoCodesNav"), icon: Ticket },
  ];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:px-8">
      <aside className="shrink-0 lg:w-56">
        <nav className="flex gap-1.5 overflow-x-auto lg:sticky lg:top-24 lg:flex-col lg:overflow-visible">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              <item.icon className="size-4" /> {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
