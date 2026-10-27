import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AdminSearch } from "@/components/admin/admin-search";
import { DeleteButton } from "@/components/admin/delete-button";
import { UserBanToggle, UserRoleSelect } from "@/components/admin/user-row-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { prisma } from "@/lib/prisma";
import { formatRelativeTime, initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Users" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const t = await getTranslations("admin");

  const users = await prisma.user.findMany({
    where: q
      ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true, name: true, email: true, image: true, role: true, isBanned: true, createdAt: true,
      _count: { select: { posts: true, reviews: true } },
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl">{t("usersNav")}</h1>
        <AdminSearch initialValue={q} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="p-3 font-medium">{t("name")}</th>
              <th className="p-3 font-medium">{t("email")}</th>
              <th className="p-3 font-medium">{t("role")}</th>
              <th className="p-3 font-medium">{t("postsNav")}</th>
              <th className="p-3 font-medium">{t("joined")}</th>
              <th className="p-3 font-medium">{t("active")}/{t("banned")}</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">{t("noResults")}</td></tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-none">
                <td className="p-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-8">
                      <AvatarImage src={u.image ?? undefined} alt={u.name ?? "User"} />
                      <AvatarFallback className="text-[10px]">{initials(u.name ?? "U")}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{u.name}</span>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{u.email}</td>
                <td className="p-3"><UserRoleSelect userId={u.id} role={u.role} /></td>
                <td className="p-3 text-muted-foreground">{u._count.posts}</td>
                <td className="p-3 text-muted-foreground">{formatRelativeTime(u.createdAt)}</td>
                <td className="p-3"><UserBanToggle userId={u.id} banned={u.isBanned} /></td>
                <td className="p-3 text-right">
                  <DeleteButton url={`/api/admin/users/${u.id}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
