"use client";

import {
  BookmarkCheck,
  CalendarDays,
  Crown,
  LayoutDashboard,
  LogOut,
  Plus,
  Radar,
  User as UserIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initials } from "@/lib/utils";

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: "USER" | "ADMIN";
};

export function UserMenu({ user }: { user: SessionUser }) {
  const t = useTranslations();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full ring-offset-2 ring-offset-background transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar className="size-9 border border-border">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? "You"} />
            <AvatarFallback>{initials(user.name ?? user.email ?? "U")}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">{user.name ?? "VIBECAFE"}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/create"><Plus className="size-4" /> {t("nav.createPost")}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile"><UserIcon className="size-4" /> {t("nav.profile")}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/saved"><BookmarkCheck className="size-4" /> {t("nav.savedPlaces")}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/events"><CalendarDays className="size-4" /> {t("nav.events")}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/networking"><Radar className="size-4" /> {t("nav.networking")}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/pricing"><Crown className="size-4" /> {t("nav.pricing")}</Link>
        </DropdownMenuItem>
        {user.role === "ADMIN" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin"><LayoutDashboard className="size-4" /> {t("nav.admin")}</Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => signOut({ callbackUrl: "/" })} className="text-destructive focus:text-destructive">
          <LogOut className="size-4" /> {t("common.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SignInButton() {
  const t = useTranslations("common");
  return (
    <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
      <Link href="/signin">{t("signIn")}</Link>
    </Button>
  );
}
