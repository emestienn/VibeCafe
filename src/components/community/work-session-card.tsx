import { Clock, MapPin } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/utils";
import { JoinSessionButton } from "@/components/cafe/join-session-button";

export type WorkSessionCardData = {
  id: string;
  title: string;
  category: string;
  topics: string[];
  untilTime: Date | null;
  user: { id: string; name: string | null; image: string | null };
  cafe: { id: string; name: string; slug: string };
};

export function WorkSessionCard({ session }: { session: WorkSessionCardData }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
      <Avatar className="size-10">
        <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? "User"} />
        <AvatarFallback>{initials(session.user.name ?? "U")}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{session.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Link href={`/cafe/${session.cafe.slug}`} className="flex items-center gap-1 hover:text-foreground">
            <MapPin className="size-3" /> {session.cafe.name}
          </Link>
          {session.untilTime && (
            <span className="flex items-center gap-1">
              <Clock className="size-3" /> {new Date(session.untilTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="font-normal">{session.category}</Badge>
          {session.topics.map((topic) => (
            <Badge key={topic} variant="outline" className="font-normal">{topic}</Badge>
          ))}
        </div>
      </div>
      <JoinSessionButton sessionId={session.id} />
    </div>
  );
}
