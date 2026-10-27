import { useTranslations } from "next-intl";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/utils";
import { FollowButton } from "@/components/profile/follow-button";

import { ConnectButton } from "./connect-button";

export type PersonCardData = {
  userId: string;
  name: string;
  image: string | null;
  profession: string | null;
  bio: string | null;
  interests: string[];
  isOpenToNetworking: boolean;
  networkingMessage: string | null;
  matchPercent?: number;
  sharedInterests?: string[];
  connectionState?: "none" | "pending" | "connected";
};

export function PersonCard({ person }: { person: PersonCardData }) {
  const t = useTranslations("community");

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <Link href={`/profile/${person.userId}`}>
          <Avatar className="size-12 border border-border">
            <AvatarImage src={person.image ?? undefined} alt={person.name} />
            <AvatarFallback>{initials(person.name)}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link href={`/profile/${person.userId}`} className="truncate font-display text-base hover:underline">
              {person.name}
            </Link>
            {person.isOpenToNetworking && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-olive">
                <span className="size-1.5 rounded-full bg-olive" /> {t("open")}
              </span>
            )}
          </div>
          {person.profession && <p className="text-xs text-muted-foreground">{person.profession}</p>}
        </div>
        {typeof person.matchPercent === "number" && (
          <div className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-center text-xs font-semibold text-accent-foreground">
            {person.matchPercent}% {t("interestMatch")}
          </div>
        )}
      </div>

      {(person.networkingMessage || person.bio) && (
        <p className="line-clamp-2 text-sm text-muted-foreground">{person.networkingMessage || person.bio}</p>
      )}

      {person.interests.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {person.interests.slice(0, 5).map((interest) => (
            <Badge
              key={interest}
              variant={person.sharedInterests?.includes(interest) ? "accent" : "secondary"}
              className="font-normal"
            >
              {interest}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <FollowButton userId={person.userId} />
        <ConnectButton recipientId={person.userId} initialState={person.connectionState} />
      </div>
    </div>
  );
}
